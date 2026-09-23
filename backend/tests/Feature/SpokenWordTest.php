<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\LessonSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpokenWordTest extends TestCase
{
    use RefreshDatabase;

    public function test_spoken_requires_a_token(): void
    {
        $this->seed(LessonSeeder::class);

        $this->postJson('/api/vocab-items/1/spoken', [
            'heard' => 'Hujambo',
        ])->assertUnauthorized();
    }

    public function test_matching_heard_marks_the_word_passed(): void
    {
        $this->seed(LessonSeeder::class);

        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/vocab-items/1/spoken', [
            'heard' => 'Hujambo',
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('spoken.passed', true);

        $this->getJson('/api/lessons/1', [
            'Authorization' => "Bearer {$token}",
        ])->assertJsonPath('lesson.words.0.spoken', true);
    }

    public function test_wrong_heard_does_not_pass(): void
    {
        $this->seed(LessonSeeder::class);

        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/vocab-items/1/spoken', [
            'heard' => 'asdf',
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('spoken.passed', false);

        $this->getJson('/api/lessons/1', [
            'Authorization' => "Bearer {$token}",
        ])->assertJsonPath('lesson.words.0.spoken', false);
    }

    public function test_a_later_miss_does_not_clear_a_pass(): void
    {
        $this->seed(LessonSeeder::class);

        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->postJson('/api/vocab-items/1/spoken', [
            'heard' => 'Hujambo',
        ], $headers)->assertJsonPath('spoken.passed', true);

        $this->postJson('/api/vocab-items/1/spoken', [
            'heard' => 'nope',
        ], $headers)->assertJsonPath('spoken.passed', true);
    }
}