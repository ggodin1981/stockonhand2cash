<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiClient
{
    protected string $provider;
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->provider = config('services.ai.provider');
        $this->apiKey   = config('services.ai.api_key');
        $this->model    = config('services.ai.model');
        $this->baseUrl  = rtrim(config('services.ai.base_url'), '/');
    }

    public function chat(array $messages): string
    {
        if (!$this->apiKey) {
            throw new RuntimeException('AI_API_KEY is not configured.');
        }

        $payload = [
            'model'    => $this->model,
            'messages' => $messages,
        ];

        $response = Http::withToken($this->apiKey)->post($this->baseUrl, $payload);
        $response->throw();

        $data = $response->json();

        if (!isset($data['choices'][0]['message']['content'])) {
            throw new RuntimeException('Unexpected AI response payload.');
        }

        return $data['choices'][0]['message']['content'];
    }
}
