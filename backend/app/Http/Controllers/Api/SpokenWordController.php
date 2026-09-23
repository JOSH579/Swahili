<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSpokenWordRequest;
use App\Models\SpokenWord;
use App\Models\VocabItem;
use Illuminate\Http\JsonResponse;

class SpokenWordController extends Controller
{
    public function store(StoreSpokenWordRequest $request, VocabItem $vocabItem): JsonResponse
    {
        $heard = $request->validated('heard');
        $passed = $this->isClose($heard, $vocabItem->swahili);

        $record = SpokenWord::query()->firstOrNew([
            'user_id' => $request->user()->id,
            'vocab_item_id' => $vocabItem->id,
        ]);

        $record->heard = $heard;
        if ($passed || ! $record->exists) {
            $record->passed = $passed;
        }
        $record->save();

        return response()->json([
            'spoken' => [
                'vocab_item_id' => $vocabItem->id,
                'heard' => $record->heard,
                'passed' => $record->passed,
            ],
        ]);
    }

    private function isClose(string $heard, string $expected): bool
    {
        $a = preg_replace('/\s+/', ' ', strtolower(trim($heard)));
        $b = preg_replace('/\s+/', ' ', strtolower(trim($expected)));

        return $a === $b || str_contains($a, $b) || str_contains($b, $a);
    }
}