<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ShopifyClient
{
    protected string $domain;
    protected string $accessToken;
    protected string $version;

    public function __construct()
    {
        $this->domain      = config('services.shopify.domain');
        $this->accessToken = config('services.shopify.access_token');
        $this->version     = config('services.shopify.api_version');
    }

    protected function baseUrl(): string
    {
        return "https://{$this->domain}/admin/api/{$this->version}";
    }

    protected function client()
    {
        return Http::withHeaders([
            'X-Shopify-Access-Token' => $this->accessToken,
            'Content-Type'           => 'application/json',
        ]);
    }

    public function getProducts(int $limit = 50, ?string $pageInfo = null): array
    {
        $url = $this->baseUrl() . '/products.json';
        $params = ['limit' => $limit];

        if ($pageInfo) {
            $params['page_info'] = $pageInfo;
        }

        $response = $this->client()->get($url, $params);
        $response->throw();

        return $response->json('products') ?? [];
    }

    public function getOrders(int $limit = 50, ?string $status = 'any'): array
    {
        $url = $this->baseUrl() . '/orders.json';
        $params = [
            'limit'  => $limit,
            'status' => $status,
        ];

        $response = $this->client()->get($url, $params);
        $response->throw();

        return $response->json('orders') ?? [];
    }
}
