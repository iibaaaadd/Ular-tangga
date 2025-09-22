<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin'
        ]);

        // Create teacher user
        User::factory()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@example.com',
            'password' => bcrypt('password123'),
            'role' => 'teacher'
        ]);

        // Create some student users
        User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student'
        ]);

        User::factory()->create([
            'name' => 'Jane Smith', 
            'email' => 'jane@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student'
        ]);

        User::factory()->create([
            'name' => 'Bob Wilson',
            'email' => 'bob@example.com',
            'password' => bcrypt('password123'),
            'role' => 'student'
        ]);

        // Create more random users (factory sudah include password)
        User::factory(10)->create();
    }
}
