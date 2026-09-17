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
        return [
            'skip' => ['sometimes', 'boolean'],
            'self_level' => ['required_unless:skip,true', 'in:none,some,lots'],
            'checks' => ['required_unless:skip,true', 'array'],
            'checks.*' => ['string'],
        ];
    }
}