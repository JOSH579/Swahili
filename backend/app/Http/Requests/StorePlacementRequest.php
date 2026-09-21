<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePlacementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->boolean('skip') || $this->boolean('confirm')) {
            return [
                'skip' => ['sometimes', 'boolean'],
                'confirm' => ['sometimes', 'boolean'],
                'placement' => ['required_if:confirm,true', 'in:starter,survival,beyond'],
            ];
        }

        return [
            'self_level' => ['required', 'in:none,some,lots'],
            'checks' => ['required', 'array'],
            'checks.*' => ['string'],
        ];
    }
}