<?php

namespace App\Models;

class LightNovel extends Media
{
    public function __construct(
        string $title,
        string $genre,
        int $year,
        string $description
    ) {
        parent::__construct(
            $title,
            $genre,
            $year,
            $description
        );
    }

    public function getCategory(): string
    {
        return "Light Novel";
    }
}
