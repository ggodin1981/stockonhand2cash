<?php

return [

    'shopify' => [
        'domain'       => env('SHOPIFY_SHOP_DOMAIN'),
        'access_token' => env('SHOPIFY_ACCESS_TOKEN'),
        'api_version'  => env('SHOPIFY_API_VERSION', '2025-01'),
    ],

    'ai' => [
        'provider'  => env('AI_PROVIDER', 'openai'),
        'api_key'   => env('AI_API_KEY'),
        'model'     => env('AI_MODEL', 'gpt-4.1-mini'),
        'base_url'  => env('AI_BASE_URL', 'https://api.openai.com/v1/chat/completions'),
    ],

];
