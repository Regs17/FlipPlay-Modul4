<?php

namespace App\Models;

class User
{
    private string $name;
    private array $collection = [];

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function addToCollection(Media $media): void
    {
        $this->collection[] = $media;
    }

    public function removeFromCollection(Media $media): void
    {
        foreach ($this->collection as $index => $item) {
            if ($item === $media) {
                unset($this->collection[$index]);
            }
        }

        $this->collection = array_values($this->collection);
    }

    public function getCollection(): array
    {
        return $this->collection;
    }
}
