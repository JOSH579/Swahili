<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlacementRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PlacementController extends Controller
{
    private const CHECKS = [
        [
            'id' => 'hujambo',
            'type' => 'choice',
            'band' => 'easy',
            'prompt' => 'Hello',
            'options' => ['Hujambo', 'Kwaheri', 'Asante', 'Hapana'],
            'answers' => ['hujambo'],
        ],
        [
            'id' => 'ndiyo',
            'type' => 'choice',
            'band' => 'easy',
            'prompt' => 'Yes',
            'options' => ['Hapana', 'Ndiyo', 'Sijambo', 'Kwaheri'],
            'answers' => ['ndiyo'],
        ],
        [
            'id' => 'tafadhali',
            'type' => 'choice',
            'band' => 'easy',
            'prompt' => 'Please',
            'options' => ['Asante', 'Karibu', 'Tafadhali', 'Hujambo'],
            'answers' => ['tafadhali'],
        ],
        [
            'id' => 'kwaheri',
            'type' => 'choice',
            'band' => 'easy',
            'prompt' => 'Goodbye',
            'options' => ['Karibu', 'Hujambo', 'Kwaheri', 'Ndiyo'],
            'answers' => ['kwaheri'],
        ],
        [
            'id' => 'asante',
            'type' => 'fill',
            'band' => 'fill',
            'prompt' => 'Thank you',
            'answers' => ['asante'],
        ],
        [
            'id' => 'habari',
            'type' => 'fill',
            'band' => 'hard',
            'prompt' => 'How are you?',
            'answers' => ['habari', 'habari yako', 'habari yako?'],
        ],
    ];

    private const RANK = [
        'starter' => 1,
        'survival' => 2,
        'beyond' => 3,
    ];

    public function show(): JsonResponse
    {
        $questions = collect(self::CHECKS)->map(function ($check) {
            $item = [
                'id' => $check['id'],
                'type' => $check['type'],
                'prompt' => $check['prompt'],
            ];

            if ($check['type'] === 'choice') {
                $item['options'] = collect($check['options'])->shuffle()->values();
            }

            return $item;
        })->values();

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
            $user->update([
                'placement' => User::PLACEMENT_STARTER,
                'onboarded_at' => now(),
            ]);

            return response()->json([
                'message' => 'Placement saved.',
                'user' => $user->fresh()->toApiArray(),
            ]);
        }

        if ($request->boolean('confirm')) {
            return $this->confirmPlacement($request, $user);
        }

        $answers = $request->validated('checks');
        $easy = 0;
        $fill = false;
        $hard = false;

        foreach (self::CHECKS as $check) {
            $picked = $answers[$check['id']] ?? '';
            if (! $this->matches($picked, $check['answers'])) {
                continue;
            }

            if ($check['band'] === 'easy') {
                $easy++;
            }

            if ($check['band'] === 'fill') {
                $fill = true;
            }

            if ($check['band'] === 'hard') {
                $hard = true;
            }
        }

        $suggested = $this->decidePlacement(
            $easy,
            $fill,
            $hard,
            $request->validated('self_level')
        );

        $user->update([
            'placement' => $suggested,
        ]);

        return response()->json([
            'message' => 'Placement suggested.',
            'suggested' => $suggested,
            'user' => $user->fresh()->toApiArray(),
        ]);
    }

    private function confirmPlacement(StorePlacementRequest $request, User $user): JsonResponse
    {
        if (! $user->placement) {
            throw ValidationException::withMessages([
                'placement' => ['Finish the checks before confirming a stage.'],
            ]);
        }

        $chosen = $request->validated('placement');
        $chosenRank = self::RANK[$chosen];
        $suggestedRank = self::RANK[$user->placement];

        if ($chosenRank > $suggestedRank) {
            throw ValidationException::withMessages([
                'placement' => ['You can start lower, not higher, than the suggested stage.'],
            ]);
        }

        $user->update([
            'placement' => $chosen,
            'onboarded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Placement saved.',
            'user' => $user->fresh()->toApiArray(),
        ]);
    }

    private function decidePlacement(int $easy, bool $fill, bool $hard, string $selfLevel): string
    {
        if ($easy <= 2) {
            return User::PLACEMENT_STARTER;
        }

        if ($fill && $hard && $selfLevel === 'lots') {
            return User::PLACEMENT_BEYOND;
        }

        return User::PLACEMENT_SURVIVAL;
    }

    private function matches(string $picked, array $answers): bool
    {
        $normalized = preg_replace('/\s+/', ' ', strtolower(trim($picked)));

        foreach ($answers as $answer) {
            $ok = preg_replace('/\s+/', ' ', strtolower(trim($answer)));
            if ($normalized === $ok) {
                return true;
            }
        }

        return false;
    }
}