<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Media;
use Illuminate\Http\Request;

class UserMediaController extends Controller
{
    // Melihat koleksi media milik user
    public function index(string $userId)
    {
        $user = User::findOrFail($userId);

        return response()->json([
            'message' => 'Koleksi media berhasil diambil',
            'data' => $user->media
        ], 200);
    }

    // Menambahkan media ke koleksi user
    public function store(Request $request, string $userId)
    {
        $request->validate([
            'media_id' => 'required|exists:media,id'
        ]);

        $user = User::findOrFail($userId);
        $media = Media::findOrFail($request->media_id);

        // Cek apakah media sudah ada di koleksi
        if ($user->media()->where('media.id', $media->id)->exists()) {
            return response()->json([
                'message' => 'Media sudah ada di koleksi user'
            ], 409);
        }

        $user->media()->attach($media->id);

        return response()->json([
            'message' => 'Media berhasil ditambahkan ke koleksi',
            'data' => $media
        ], 201);
    }

    // Menghapus media dari koleksi user
    public function destroy(string $userId, string $mediaId)
    {
        $user = User::findOrFail($userId);
        $media = Media::findOrFail($mediaId);

        if (!$user->media()->where('media.id', $media->id)->exists()) {
            return response()->json([
                'message' => 'Media tidak ditemukan dalam koleksi user'
            ], 404);
        }

        $user->media()->detach($media->id);

        return response()->json([
            'message' => 'Media berhasil dihapus dari koleksi'
        ], 200);
    }
}
