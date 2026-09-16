<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

class LessonController extends Controller
{
    public function index(): JsonResponse
    {
        $lessons = Lesson::query()
            ->withCount('vocabItems as word_count')
            ->orderBy('id')
            ->get(['id', 'title', 'slug', 'description']);

        return response()->json([
            'lessons' => $lessons,
        ]);
    }

    public function show(Lesson $lesson): JsonResponse
    {
        $lesson->load('vocabItems');

        return response()->json([
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'slug' => $lesson->slug,
                'description' => $lesson->description,
                'words' => $lesson->vocabItems->map(fn ($word) => [
                    'id' => $word->id,
                    'swahili' => $word->swahili,
                    'english' => $word->english,
                ]),
            ],
        ]);
    }
}