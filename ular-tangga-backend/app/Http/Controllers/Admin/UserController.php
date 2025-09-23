<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        // Pastikan hanya admin yang bisa akses
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $perPage = $request->get('per_page', 10); // Default 10 items per page
        $search = $request->get('search', '');
        $role = $request->get('role', ''); // Filter by role

        $query = User::select('id', 'name', 'email', 'role', 'created_at')
                    ->orderBy('created_at', 'desc');

        // Add search functionality
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Add role filter
        if ($role && in_array($role, ['admin', 'teacher', 'student'])) {
            $query->where('role', $role);
        }

        $users = $query->paginate($perPage);

        $formattedUsers = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'createdAt' => $user->created_at->format('Y-m-d')
            ];
        });

        return response()->json([
            'users' => $formattedUsers,
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
                'has_more_pages' => $users->hasMorePages()
            ]
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        // Pastikan hanya admin yang bisa akses
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,teacher,admin'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'createdAt' => $user->created_at->format('Y-m-d')
            ],
            'message' => 'User created successfully'
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(Request $request, $id)
    {
        // Pastikan hanya admin yang bisa akses
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'createdAt' => $user->created_at->format('Y-m-d')
            ]
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, $id)
    {
        // Pastikan hanya admin yang bisa akses
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:student,teacher,admin'
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->has('role')) {
            $user->role = $request->role;
        }

        $user->save();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'createdAt' => $user->created_at->format('Y-m-d')
            ],
            'message' => 'User updated successfully'
        ]);
    }

    /**
     * Remove the specified user
     */
    public function destroy(Request $request, $id)
    {
        // Pastikan hanya admin yang bisa akses
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Mencegah admin menghapus diri sendiri
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Cannot delete your own account'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}