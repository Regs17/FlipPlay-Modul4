<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $mediaId = $this->route('media') ?? $this->route('medium');

        return [
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('media', 'title')->ignore($mediaId),
            ],
            'category' => 'sometimes|required|string',
            'genre' => 'sometimes|required|string',
            'release_year' => 'sometimes|required|integer',
            'description' => 'sometimes|nullable|string',
            'image' => 'sometimes|nullable|string',
        ];
    }
}
