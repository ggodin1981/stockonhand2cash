<?php

namespace App\Http\Controllers;

use App\Services\AiStockAnalystService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiStockAnalystController extends Controller
{
    public function __construct(
        protected AiStockAnalystService $analystService
    ) {}

    public function analyse(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:2000'],
        ]);

        $answer = $this->analystService->analyse($data['question']);

        return response()->json([
            'question' => $data['question'],
            'answer'   => $answer,
        ]);
    }

    public function dailySummary(): JsonResponse
    {
        $summary = $this->analystService->dailySummary();

        return response()->json([
            'summary' => $summary,
        ]);
    }
}
