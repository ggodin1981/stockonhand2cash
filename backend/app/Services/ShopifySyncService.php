<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ShopifySyncService
{
    public function __construct(
        protected ShopifyClient $client
    ) {}

    public function syncProducts(): int
    {
        $shopifyProducts = $this->client->getProducts(100);

        DB::transaction(function () use ($shopifyProducts) {
            foreach ($shopifyProducts as $sp) {
                Product::updateOrCreate(
                    ['shopify_id' => $sp['id']],
                    [
                        'title'           => $sp['title'] ?? '',
                        'body_html'       => $sp['body_html'] ?? '',
                        'handle'          => $sp['handle'] ?? null,
                        'status'          => $sp['status'] ?? 'active',
                        'total_inventory' => $sp['variants'][0]['inventory_quantity'] ?? 0,
                        'image'           => $sp['image']['src'] ?? null,
                    ]
                );
            }
        });

        return count($shopifyProducts);
    }

    public function syncOrders(): int
    {
        $shopifyOrders = $this->client->getOrders(100, 'any');

        DB::transaction(function () use ($shopifyOrders) {
            foreach ($shopifyOrders as $so) {
                $order = Order::updateOrCreate(
                    ['shopify_id' => $so['id']],
                    [
                        'name'               => $so['name'] ?? '',
                        'financial_status'   => $so['financial_status'] ?? null,
                        'fulfillment_status' => $so['fulfillment_status'] ?? null,
                        'total_price'        => $so['total_price'] ?? 0,
                        'currency'           => $so['currency'] ?? 'AUD',
                        'ordered_at'         => isset($so['created_at'])
                            ? Carbon::parse($so['created_at'])
                            : null,
                    ]
                );

                $lineItems = $so['line_items'] ?? [];
                foreach ($lineItems as $li) {
                    $product = isset($li['product_id'])
                        ? Product::where('shopify_id', $li['product_id'])->first()
                        : null;

                    OrderItem::updateOrCreate(
                        [
                            'order_id'             => $order->id,
                            'shopify_line_item_id' => $li['id'] ?? null,
                        ],
                        [
                            'product_id'  => $product?->id,
                            'quantity'    => $li['quantity'] ?? 0,
                            'price'       => $li['price'] ?? 0,
                            'total_price' => ($li['quantity'] ?? 0) * ($li['price'] ?? 0),
                        ]
                    );
                }
            }
        });

        return count($shopifyOrders);
    }
}
