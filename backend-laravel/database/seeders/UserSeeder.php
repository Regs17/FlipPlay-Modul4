<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'demo@flipplay.com'],
            [
                'name' => 'User Demo',
                'password' => Hash::make('password123'),
            ]
        );
    }
}
