<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\LessonSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonTest extends TestCase
{
    use RefreshDatabase;

    public function test_lessons_require_a_token(): void
    {
        $this->getJson('/api/lessons')->assertUnauthorized();
    }

    public function test_authenticated_user_can_list_lessons(): void
    {
        $this->seed(LessonSeeder::class);

        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->getJson('/api/lessons', [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('lessons.0.title', 'Greetings')
            ->assertJsonPath('lessons.0.word_count', 9);
    }

    public function test_authenticated_user_can_view_a_lesson(): void
    {
        $this->seed(LessonSeeder::class);

        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->getJson('/api/lessons/1', [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('lesson.words.0.swahili', 'Hujambo')
            ->assertJsonPath('lesson.words.0.english', 'Hello');
    }

    public function test_quiz_requires_a_token(): void
    {
        $this->getJson('/api/lessons/1/quiz')->assertUnauthorized();
    }

    public function test_authenticated_user_can_take_a_quiz(): void
    {
        $this->seed(LessonSeeder::class);

        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $response = $this->getJson('/api/lessons/1/quiz', [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();

        $response->assertJsonCount(9, 'quiz.questions');

        $question = $response->json('quiz.questions.0');

        $this->assertCount(4, $question['options']);
        $this->assertContains($question['answer'], $question['options']);
    }
}