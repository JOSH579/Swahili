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
            ->assertJsonCount(6, 'questions')
            ->assertJsonPath('questions.0.type', 'choice')
            ->assertJsonPath('questions.4.type', 'fill')
            ->assertJsonPath('questions.5.type', 'fill')
            ->assertJsonMissingPath('questions.0.answer')
            ->assertJsonMissingPath('questions.0.answers');
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

    public function test_missing_easy_questions_places_starter(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'self_level' => 'lots',
            'checks' => [
                'hujambo' => 'Kwaheri',
                'ndiyo' => 'Hapana',
                'tafadhali' => 'Asante',
                'kwaheri' => 'Ndiyo',
                'asante' => 'asante',
                'habari' => 'habari yako',
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('user.placement', User::PLACEMENT_STARTER);

        $this->assertNull($user->fresh()->onboarded_at);
    }

    public function test_easy_hits_and_hard_misses_place_survival(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'self_level' => 'lots',
            'checks' => [
                'hujambo' => 'Hujambo',
                'ndiyo' => 'Ndiyo',
                'tafadhali' => 'Tafadhali',
                'kwaheri' => 'Kwaheri',
                'asante' => 'wrong',
                'habari' => 'wrong',
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('suggested', User::PLACEMENT_SURVIVAL)
            ->assertJsonPath('user.placement', User::PLACEMENT_SURVIVAL);

        $this->assertNull($user->fresh()->onboarded_at);
    }

    public function test_perfect_score_and_lots_suggests_beyond(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'self_level' => 'lots',
            'checks' => [
                'hujambo' => 'Hujambo',
                'ndiyo' => 'Ndiyo',
                'tafadhali' => 'Tafadhali',
                'kwaheri' => 'Kwaheri',
                'asante' => 'Asante',
                'habari' => 'Habari yako',
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('suggested', User::PLACEMENT_BEYOND);
    }

    public function test_fill_in_answers_are_case_insensitive(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'self_level' => 'lots',
            'checks' => [
                'hujambo' => 'Hujambo',
                'ndiyo' => 'Ndiyo',
                'tafadhali' => 'Tafadhali',
                'kwaheri' => 'Kwaheri',
                'asante' => '  ASANTE  ',
                'habari' => 'HABARI YAKO',
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('suggested', User::PLACEMENT_BEYOND);
    }

    public function test_user_can_confirm_a_lower_stage(): void
    {
        $user = User::factory()->create([
            'placement' => User::PLACEMENT_BEYOND,
        ]);
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'confirm' => true,
            'placement' => User::PLACEMENT_STARTER,
        ], [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('user.placement', User::PLACEMENT_STARTER);

        $this->assertNotNull($user->fresh()->onboarded_at);
    }

    public function test_user_cannot_confirm_a_higher_stage(): void
    {
        $user = User::factory()->create([
            'placement' => User::PLACEMENT_STARTER,
        ]);
        $token = $user->createToken('web')->plainTextToken;

        $this->postJson('/api/placement', [
            'confirm' => true,
            'placement' => User::PLACEMENT_BEYOND,
        ], [
            'Authorization' => "Bearer {$token}",
        ])->assertUnprocessable();

        $this->assertNull($user->fresh()->onboarded_at);
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