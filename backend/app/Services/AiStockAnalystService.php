<?php

namespace App\Services;

use App\Models\AiQuery;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AiStockAnalystService
{
    public function __construct(
        protected AiClient $aiClient
    ) {}

    public function analyse(string $question): string
    {
        $totalProducts = Product::count();
        $totalOrders   = Order::count();
        $totalRevenue  = Order::sum('total_price');

        $bestSellers = OrderItem::select(
                'products.id as product_id',
                'products.title',
                DB::raw('SUM(order_items.quantity) as total_quantity_sold'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->groupBy('products.id', 'products.title')
            ->orderByDesc('total_quantity_sold')
            ->limit(10)
            ->get();

        $lowStockThreshold = 10;
        $lowStock = Product::where('total_inventory', '<', $lowStockThreshold)
            ->orderBy('total_inventory', 'asc')
            ->limit(20)
            ->get(['title', 'total_inventory', 'status', 'is_on_sale', 'discount_percent']);

        $nearExpiry = Product::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [now(), now()->addDays(30)])
            ->orderBy('expiry_date', 'asc')
            ->limit(20)
            ->get(['title', 'expiry_date', 'total_inventory', 'is_on_sale', 'discount_percent']);

        $onSale = Product::where('is_on_sale', true)
            ->orderByDesc('discount_percent')
            ->limit(20)
            ->get(['title', 'discount_percent', 'total_inventory', 'status']);

        $context = $this->buildContext(
            $totalProducts,
            $totalOrders,
            $totalRevenue,
            $bestSellers,
            $lowStock,
            $nearExpiry,
            $onSale
        );

        $messages = [
            [
                'role'    => 'system',
                'content' => "You are a senior commerce back-office analyst for an e-commerce cosmetics brand.
You have access to inventory, sales, and promotion data.

GOALS:
1. Analyse stock levels, sales performance, discounts and expiries.
2. Highlight risks (stockouts, overstock, expiring items).
3. Suggest clear, practical actions (reorder, change discounts, run promotions, stop discounts, etc.).

RULES:
- Base your advice ONLY on the provided context. Do NOT invent data.
- If the user asks for something you don't have data for, say so and suggest what data is needed.
- Always structure your answer with these sections (if relevant):

   1) Inventory Health
   2) Sales Performance & Best Sellers
   3) Promotions & Discounts
   4) Risks & Alerts (stockout / expiry)
   5) Recommended Actions (bullet point list)

- Use bullet points and short paragraphs suitable for a commerce back-office dashboard.",
            ],
            [
                'role'    => 'user',
                'content' => "Here is the current commerce back-office context:\n\n" . $context .
                    "\n\nUser question:\n" . $question,
            ],
        ];

        $answer = $this->aiClient->chat($messages);

        AiQuery::create([
            'type'     => 'stock_analyst',
            'question' => $question,
            'answer'   => $answer,
            'meta'     => [
                'total_products' => $totalProducts,
                'total_orders'   => $totalOrders,
                'total_revenue'  => $totalRevenue,
                'author'         => config('app.author'),
            ],
        ]);

        return $answer;
    }

    protected function buildContext(
        int $totalProducts,
        int $totalOrders,
        float $totalRevenue,
        Collection $bestSellers,
        Collection $lowStock,
        Collection $nearExpiry,
        Collection $onSale
    ): string {
        $lines = [];

        $lines[] = "=== High-level Summary ===";
        $lines[] = "- Total products: {$totalProducts}";
        $lines[] = "- Total orders: {$totalOrders}";
        $lines[] = "- Total revenue (all time): {$totalRevenue}";
        $lines[] = "";

        $lines[] = "=== Top Best-Selling Items (by quantity) ===";
        if ($bestSellers->isEmpty()) {
            $lines[] = "- No best-seller data available yet.";
        } else {
            foreach ($bestSellers as $b) {
                $lines[] = "- {$b->title} | Qty sold: {$b->total_quantity_sold} | Revenue: {$b->total_revenue}";
            }
        }
        $lines[] = "";

        $lines[] = "=== Low Stock Alerts (near out of stock) ===";
        if ($lowStock->isEmpty()) {
            $lines[] = "- No low-stock products under threshold.";
        } else {
            foreach ($lowStock as $p) {
                $saleInfo = $p->is_on_sale
                    ? " | On sale: {$p->discount_percent}%"
                    : "";
                $lines[] = "- {$p->title} | Inventory: {$p->total_inventory}{$saleInfo}";
            }
        }
        $lines[] = "";

        $lines[] = "=== Near Expiry (next 30 days) ===";
        if ($nearExpiry->isEmpty()) {
            $lines[] = "- No products close to expiry.";
        } else {
            foreach ($nearExpiry as $p) {
                $date = $p->expiry_date ? $p->expiry_date->toDateString() : 'N/A';
                $saleInfo = $p->is_on_sale
                    ? " | On sale: {$p->discount_percent}%"
                    : "";
                $lines[] = "- {$p->title} | Expiry: {$date} | Stock: {$p->total_inventory}{$saleInfo}";
            }
        }
        $lines[] = "";

        $lines[] = "=== On-Sale Items & Discounts ===";
        if ($onSale->isEmpty()) {
            $lines[] = "- No discounted items.";
        } else {
            foreach ($onSale as $p) {
                $lines[] = "- {$p->title} | Discount: {$p->discount_percent}% | Stock: {$p->total_inventory}";
            }
        }

        return implode("\n", $lines);
    }

    public function dailySummary(): string
    {
        $question = "Provide a concise daily commerce back-office summary.
Focus on:
- today's total sales and orders (if visible in the context),
- any obvious best-selling items,
- urgent stock risks (low stock / near expiry),
- any important notes on discounts.

Keep it under 10 bullet points.";

        return $this->analyse($question);
    }
}
