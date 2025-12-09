<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\ShopifySyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ShopifySyncController extends Controller
{
    public function __construct(
        protected ShopifySyncService $syncService
    ) {}

    public function syncProducts(): JsonResponse
    {
        $count = $this->syncService->syncProducts();

        return response()->json([
            'synced_products' => $count,
        ]);
    }

    public function syncOrders(): JsonResponse
    {
        $count = $this->syncService->syncOrders();

        return response()->json([
            'synced_orders' => $count,
        ]);
    }

    public function dashboard(): JsonResponse
    {
        $totalProducts = Product::count();
        $totalOrders   = Order::count();
        $totalRevenue  = Order::sum('total_price');

        $today = now()->toDateString();

        $todaySalesTotal = Order::whereDate('ordered_at', $today)
            ->sum('total_price');

        $todayOrdersCount = Order::whereDate('ordered_at', $today)
            ->count();

        $bestSellers = OrderItem::select(
                'products.id as product_id',
                'products.title',
                DB::raw('SUM(order_items.quantity) as total_quantity_sold'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->groupBy('products.id', 'products.title')
            ->orderByDesc('total_quantity_sold')
            ->limit(5)
            ->get();

        $lowStockThreshold = 10;
        $lowStockAlerts = Product::where('total_inventory', '<', $lowStockThreshold)
            ->orderBy('total_inventory', 'asc')
            ->limit(10)
            ->get(['id', 'title', 'total_inventory', 'status']);

        $nearExpiryAlerts = Product::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [now(), now()->addDays(30)])
            ->orderBy('expiry_date', 'asc')
            ->limit(10)
            ->get(['id', 'title', 'expiry_date', 'total_inventory']);

        $onSaleItems = Product::where('is_on_sale', true)
            ->orderByDesc('discount_percent')
            ->limit(10)
            ->get(['id', 'title', 'discount_percent', 'total_inventory']);

        $recentTransactions = Order::orderBy('ordered_at', 'desc')
            ->limit(10)
            ->get([
                'id',
                'name',
                'financial_status',
                'fulfillment_status',
                'total_price',
                'currency',
                'ordered_at',
            ]);

        return response()->json([
            'total_products'       => $totalProducts,
            'total_orders'         => $totalOrders,
            'total_revenue'        => $totalRevenue,
            'today_sales_total'    => $todaySalesTotal,
            'today_orders_count'   => $todayOrdersCount,
            'best_sellers'         => $bestSellers,
            'low_stock_alerts'     => $lowStockAlerts,
            'near_expiry_alerts'   => $nearExpiryAlerts,
            'on_sale_items'        => $onSaleItems,
            'recent_transactions'  => $recentTransactions,
            'author'               => config('app.author'),
        ]);
    }
}
