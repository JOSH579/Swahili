<?php

namespace Database\Seeders;

use App\Models\Lesson;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    public function run(): void
    {
        $lesson = Lesson::query()->updateOrCreate(
            ['slug' => 'greetings'],
            [
                'title' => 'Greetings',
                'description' => 'Useful words for saying hello and being polite.',
            ]
        );

        $words = [
            ['swahili' => 'Hujambo', 'english' => 'Hello'],
            ['swahili' => 'Sijambo', 'english' => 'I am fine'],
            ['swahili' => 'Asante', 'english' => 'Thank you'],
            ['swahili' => 'Tafadhali', 'english' => 'Please'],
            ['swahili' => 'Karibu', 'english' => 'Welcome'],
            ['swahili' => 'Kwaheri', 'english' => 'Goodbye'],
            ['swahili' => 'Samahani', 'english' => 'Sorry / Excuse me'],
            ['swahili' => 'Ndiyo', 'english' => 'Yes'],
            ['swahili' => 'Hapana', 'english' => 'No'],
        ];

        $lesson->vocabItems()->delete();

        foreach ($words as $index => $word) {
            $lesson->vocabItems()->create([
                'swahili' => $word['swahili'],
                'english' => $word['english'],
                'sort_order' => $index,
            ]);
        }
    }
}