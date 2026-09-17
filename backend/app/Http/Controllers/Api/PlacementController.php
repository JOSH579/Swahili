<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlacementRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class PlacementController extends Controller
{
    private const CHECKS = [
        [
            'id' => 'hujambo',
            'prompt' => 'Hello',
            'options' => ['Hujambo', 'Kwaheri', 'Asante', 'Hapana'],
            'answer' => 'Hujambo',
        ],
        [
            'id' => 'asante',
            'prompt' => 'Thank you',
            'options' => ['Tafadhali', 'Asante', 'Karibu', 'Samahani'],
            'answer' => 'Asante',
        ],
        [
            'id' => 'ndiyo',
            'prompt' => 'Yes',
            'options' => ['Hapana', 'Ndiyo', 'Sijambo', 'Kwaheri'],
            'answer' => 'Ndiyo',
        ],
        [
            'id' => 'tafadhali',
            'prompt' => 'Please',
            'options' => ['Asante', 'Karibu', 'Tafadhali', 'Hujambo'],
            'answer' => 'Tafadhali',
        ],
        [
            'id' => 'kwaheri',
            'prompt' => 'Goodbye',
            'options' => ['Karibu', 'Hujambo', 'Kwaheri', 'Ndiyo'],
            'answer' => 'Kwaheri',
        ],
    ];

    public function show(): JsonResponse
    {
        $questions = collect(self::CHECKS)->map(fn ($check) => [
            'id' => $check['id'],
            'prompt' => $check['prompt'],
            'options' => collect($check['options'])->shuffle()->values(),
        ])->values();

        return response()->json([
            'questions' => $questions,
        ]);
    }

    public function store(StorePlacementRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->onboarded_at) {
            return response()->json([
                'message' => 'Placement already saved.',
                'user' => $user->toApiArray(),
            ]);
        }

        if ($request->boolean('skip')) {
            $placement = User::PLACEMENT_STARTER;
        } else {
            $answers = $request->validated('checks');
            $correct = 0;

            foreach (self::CHECKS as $check) {
                if (($answers[$check['id']] ?? null) === $check['answer']) {
                    $correct++;
                }
            }

            $placement = $this->decidePlacement(
                $correct,
                $request->validated('self_level')
            );
        }

        $user->update([
            'placement' => $placement,
            'onboarded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Placement saved.',
            'user' => $user->fresh()->toApiArray(),
        ]);
    }

    private function decidePlacement(int $correct, string $selfLevel): string
    {
        if ($correct <= 2) {
            return User::PLACEMENT_STARTER;
        }

        if ($correct === 5 && $selfLevel === 'lots') {
            return User::PLACEMENT_BEYOND;
        }

        return User::PLACEMENT_SURVIVAL;
    }
}