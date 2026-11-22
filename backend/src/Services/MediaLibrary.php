<?php

namespace App\Services;

use App\Models\Media;

class MediaLibrary
{
    // Menyimpan seluruh data media
    private array $mediaList = [];

    // Menambahkan media ke katalog
    public function addMedia(Media $media): void
    {
        $this->mediaList[] = $media;
    }

    // Mengambil seluruh daftar media
    public function getAllMedia(): array
    {
        return $this->mediaList;
    }

    // Mencari media berdasarkan judul
    public function searchMedia(string $keyword): array
    {
        $results = [];

        foreach ($this->mediaList as $media) {
            if (
                stripos($media->getTitle(), $keyword) !== false
            ) {
                $results[] = $media;
            }
        }

        return $results;
    }

    // Mencari satu media berdasarkan judul
    public function findMedia(string $title): ?Media
    {
        foreach ($this->mediaList as $media) {
            if (strcasecmp($media->getTitle(), $title) === 0) {
                return $media;
            }
        }

        return null;
    }

    // Menghitung jumlah media
    public function getTotalMedia(): int
    {
        return count($this->mediaList);
    }
}
