<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spoken_words', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vocab_item_id')->constrained()->cascadeOnDelete();
            $table->string('heard')->nullable();
            $table->boolean('passed')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'vocab_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spoken_words');
    }
};