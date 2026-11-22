<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Requests\UpdateMediaRequest;
use App\Http\Resources\MediaResource;

class MediaController extends Controller
{
    // Menampilkan semua media dan mencari berdasarkan judul
    public function index(Request $request)
    {
        $query = Media::with('users');

        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        $media = $query->get();

        return MediaResource::collection($media);
    }

    // Menambahkan media baru
    public function store(StoreMediaRequest $request)
    {
        $media = Media::create($request->validated());

        return response()->json([
            'message' => 'Media berhasil ditambahkan',
            'data' => new MediaResource($media)
        ], 201);
    }

    // Menampilkan detail media beserta pengguna
    public function show(string $id)
    {
        $media = Media::with('users')->findOrFail($id);

        return response()->json([
            'message' => 'Detail media berhasil diambil',
            'data' => new MediaResource($media)
        ]);
    }

    // Mengubah data media
    public function update(UpdateMediaRequest $request, string $id)
    {
        $media = Media::findOrFail($id);

        $media->update($request->validated());

        return response()->json([
            'message' => 'Media berhasil diperbarui',
            'data' => new MediaResource($media)
        ]);
    }

    // Menghapus media
    public function destroy(string $id)
    {
        $media = Media::findOrFail($id);

        $media->delete();

        return response()->json([
            'message' => 'Media berhasil dihapus'
        ]);
    }
}
