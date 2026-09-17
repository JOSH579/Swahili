<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlacementTest extends TestCase
{
    use RefreshDatabase;

    public function test_placement_requires_a_token(): void
    {
        $this->getJson('/api/placement')->assertUnauthorized();
        $this->postJson('/api/placement', ['skip' => true])->assertUnauthorized();
    }

    public function test_authenticated_user_can_load_placement_questions(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->getJson('/api/placement', [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonCount(5, 'questions')
            ->assertJsonMissingPath('questions.0.answer');
    }

    public function test_skip_places_the_user_as_starter(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'skip' => true,
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('user.placement', User::PLACEMENT_STARTER)
            ->assertJsonPath('user.id', $user->id);

        $this->assertNotNull($user->fresh()->onboarded_at);
    }

    public function test_low_score_places_the_user_as_starter(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'self_level' => 'lots',
            'checks' => [
                'hujambo' => 'Kwaheri',
                'asante' => 'Karibu',
                'ndiyo' => 'Hapana',
                'tafadhali' => 'Asante',
                'kwaheri' => 'Ndiyo',
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('user.placement', User::PLACEMENT_STARTER);
    }

    public function test_perfect_score_and_lots_places_beyond(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'self_level' => 'lots',
            'checks' => [
                'hujambo' => 'Hujambo',
                'asante' => 'Asante',
                'ndiyo' => 'Ndiyo',
                'tafadhali' => 'Tafadhali',
                'kwaheri' => 'Kwaheri',
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('user.placement', User::PLACEMENT_BEYOND);
    }

    public function test_already_onboarded_user_is_not_replaced(): void
    {
        $user = User::factory()->create([
            'placement' => User::PLACEMENT_SURVIVAL,
            'onboarded_at' => now(),
        ]);
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'skip' => true,
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('user.placement', User::PLACEMENT_SURVIVAL);
    }
}