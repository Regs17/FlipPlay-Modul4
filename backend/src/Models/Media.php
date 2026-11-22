<?php

namespace App\Models;

class Media
{
    protected string $title;
    protected string $genre;
    protected int $year;
    protected string $description;

    public function __construct(
        string $title,
        string $genre,
        int $year,
        string $description
    ) {
        $this->title = $title;
        $this->genre = $genre;
        $this->year = $year;
        $this->description = $description;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getGenre(): string
    {
        return $this->genre;
    }

    public function getYear(): int
    {
        return $this->year;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getCategory(): string
    {
        return "Media";
    }
}