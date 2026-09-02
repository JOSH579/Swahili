<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_register_as_a_student(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Amina Guest',
            'email' => 'amina@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.email', 'amina@example.com')
            ->assertJsonPath('user.role', User::ROLE_STUDENT)
            ->assertJsonMissingPath('user.password');

        $this->assertDatabaseHas('users', [
            'email' => 'amina@example.com',
            'role' => User::ROLE_STUDENT,
        ]);
    }

    public function test_registration_requires_a_unique_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Amina Guest',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_rejects_mismatched_passwords(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Amina Guest',
            'email' => 'amina@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_visitors_cannot_choose_an_admin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Amina Guest',
            'email' => 'amina@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'amina@example.com',
            'role' => User::ROLE_STUDENT,
        ]);
    }
}
