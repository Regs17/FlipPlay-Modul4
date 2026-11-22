<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255|unique:media,title',
            'category' => 'required|string',
            'genre' => 'required|string',
            'release_year' => 'required|integer',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ];
    }
}
