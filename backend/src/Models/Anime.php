<?php

namespace App\Models;

class Anime extends Media
{
    // Constructor khusus untuk Anime
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

    // Mengubah kategori menjadi Anime
    public function getCategory(): string
    {
        return "Anime";
    }
}
