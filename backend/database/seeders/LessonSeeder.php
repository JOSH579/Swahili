<?php

namespace Database\Seeders;

use App\Models\Lesson;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    public function run(): void
    {
        $this->plant(
            'greetings',
            'Greetings',
            'starter',
            'Useful words for saying hello and being polite.',
            [
                ['swahili' => 'Hujambo', 'english' => 'Hello'],
                ['swahili' => 'Sijambo', 'english' => 'I am fine'],
                ['swahili' => 'Asante', 'english' => 'Thank you'],
                ['swahili' => 'Tafadhali', 'english' => 'Please'],
                ['swahili' => 'Karibu', 'english' => 'Welcome'],
                ['swahili' => 'Kwaheri', 'english' => 'Goodbye'],
                ['swahili' => 'Samahani', 'english' => 'Sorry / Excuse me'],
                ['swahili' => 'Ndiyo', 'english' => 'Yes'],
                ['swahili' => 'Hapana', 'english' => 'No'],
            ]
        );

        $this->plant(
            'introductions',
            'Introductions',
            'survival',
            'Say who you are, where you are from, and if you understand.',
            [
                ['swahili' => 'Jina langu ni', 'english' => 'My name is'],
                ['swahili' => 'Unaitwa nani', 'english' => 'What is your name?'],
                ['swahili' => 'Naitwa', 'english' => 'I am called'],
                ['swahili' => 'Unatoka wapi', 'english' => 'Where are you from?'],
                ['swahili' => 'Natoka', 'english' => 'I come from'],
                ['swahili' => 'Unasema Kiingereza', 'english' => 'Do you speak English?'],
                ['swahili' => 'Kidogo', 'english' => 'A little'],
                ['swahili' => 'Sielewi', 'english' => 'I do not understand'],
                ['swahili' => 'Naelewa', 'english' => 'I understand'],
            ]
        );
    }

    private function plant(
        string $slug,
        string $title,
        string $stage,
        string $description,
        array $words
    ): void {
        $lesson = Lesson::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'title' => $title,
                'stage' => $stage,
                'description' => $description,
            ]
        );

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