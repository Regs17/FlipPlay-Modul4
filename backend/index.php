
<?php

// Memanggil semua file Model
require_once __DIR__ . '/src/Models/Media.php';
require_once __DIR__ . '/src/Models/Anime.php';
require_once __DIR__ . '/src/Models/Manga.php';
require_once __DIR__ . '/src/Models/Drama.php';
require_once __DIR__ . '/src/Models/LightNovel.php';
require_once __DIR__ . '/src/Models/User.php';

// Memanggil file Service
require_once __DIR__ . '/src/Services/MediaLibrary.php';

use App\Models\Anime;
use App\Models\Manga;
use App\Models\Drama;
use App\Models\LightNovel;
use App\Models\User;
use App\Services\MediaLibrary;

// Membuat objek library
$library = new MediaLibrary();

// Membuat data awal
$anime = new Anime(
    "Naruto",
    "Action",
    2002,
    "Kisah ninja yang ingin menjadi Hokage."
);

$manga = new Manga(
    "One Piece",
    "Adventure",
    1997,
    "Petualangan bajak laut mencari harta karun."
);

$drama = new Drama(
    "Reply 1988",
    "Family",
    2015,
    "Kisah persahabatan dan keluarga di Korea."
);

$novel = new LightNovel(
    "Sword Art Online",
    "Fantasy",
    2009,
    "Petualangan pemain dalam dunia virtual."
);

// Memasukkan data ke library
$library->addMedia($anime);
$library->addMedia($manga);
$library->addMedia($drama);
$library->addMedia($novel);

// Membuat pengguna
$user = new User("Gilang");

// Memasukkan anime ke koleksi pengguna
$user->addToCollection($anime);

// Fungsi menampilkan detail media
function tampilkanDetail($media): void
{
    echo "\n=== DETAIL MEDIA ===\n";
    echo "Judul       : " . $media->getTitle() . "\n";
    echo "Kategori    : " . $media->getCategory() . "\n";
    echo "Genre       : " . $media->getGenre() . "\n";
    echo "Tahun       : " . $media->getYear() . "\n";
    echo "Deskripsi   : " . $media->getDescription() . "\n";
}

// Menu utama
while (true) {

    echo "\n============================\n";
    echo "       FLIPPLAY LIBRARY\n";
    echo "============================\n";
    echo "1. Tampilkan semua media\n";
    echo "2. Cari media berdasarkan judul\n";
    echo "3. Lihat detail media\n";
    echo "4. Lihat koleksi pengguna\n";
    echo "5. Tambahkan media ke library\n";
    echo "0. Keluar\n";
    echo "Pilih menu: ";

    $pilihan = trim(fgets(STDIN));

    switch ($pilihan) {

        case "1":
            echo "\n=== DAFTAR MEDIA ===\n";

            foreach ($library->getAllMedia() as $media) {
                echo "- " . $media->getTitle()
                    . " (" . $media->getCategory() . ")\n";
            }
            break;

        case "2":
            echo "Masukkan judul yang dicari: ";
            $keyword = trim(fgets(STDIN));

            $hasil = $library->searchMedia($keyword);

            if (count($hasil) > 0) {
                echo "\n=== HASIL PENCARIAN ===\n";

                foreach ($hasil as $media) {
                    echo "- " . $media->getTitle() . "\n";
                }
            } else {
                echo "Media tidak ditemukan.\n";
            }
            break;

        case "3":
            echo "Masukkan judul media: ";
            $judul = trim(fgets(STDIN));

            $media = $library->findMedia($judul);

            if ($media !== null) {
                tampilkanDetail($media);
            } else {
                echo "Media tidak ditemukan.\n";
            }
            break;

        case "4":
            echo "\n=== KOLEKSI " . strtoupper($user->getName()) . " ===\n";

            foreach ($user->getCollection() as $media) {
                echo "- " . $media->getTitle() . "\n";
            }
            break;

        case "5":
            echo "Pilih kategori (1. Anime, 2. Manga, 3. Drama, 4. Light Novel): ";
            $kategori = trim(fgets(STDIN));

            echo "Masukkan judul: ";
            $judul = trim(fgets(STDIN));

            echo "Masukkan genre: ";
            $genre = trim(fgets(STDIN));

            echo "Masukkan tahun: ";
            $tahun = (int) trim(fgets(STDIN));

            echo "Masukkan deskripsi: ";
            $deskripsi = trim(fgets(STDIN));

            switch ($kategori) {
                case "1":
                    $mediaBaru = new Anime($judul, $genre, $tahun, $deskripsi);
                    break;
                case "2":
                    $mediaBaru = new Manga($judul, $genre, $tahun, $deskripsi);
                    break;
                case "3":
                    $mediaBaru = new Drama($judul, $genre, $tahun, $deskripsi);
                    break;
                case "4":
                    $mediaBaru = new LightNovel($judul, $genre, $tahun, $deskripsi);
                    break;
                default:
                    echo "Kategori tidak valid.\n";
                    break 2;
            }

            $library->addMedia($mediaBaru);
            echo "Media berhasil ditambahkan!\n";
            break;

        case "0":
            echo "Terima kasih telah menggunakan FlipPlay!\n";
            exit;

        default:
            echo "Pilihan tidak valid. Silakan coba lagi.\n";
            break;
    }
}
