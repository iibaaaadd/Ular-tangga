<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    /**
     * Display a listing of the materials.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Material::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $materials = $query->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json($materials);
    }

    /**
     * Store a newly created material in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
            'is_active' => 'boolean'
        ]);

        // Handle file upload
        $pdfPath = null;
        if ($request->hasFile('pdf_file')) {
            $file = $request->file('pdf_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $pdfPath = $file->storeAs('materials', $filename, 'public');
        }

        $material = Material::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'pdf_path' => $pdfPath,
            'is_active' => $validated['is_active'] ?? true
        ]);

        return response()->json([
            'message' => 'Material created successfully',
            'material' => $material
        ], 201);
    }

    /**
     * Display the specified material.
     */
    public function show(Material $material): JsonResponse
    {
        // Load questions relationship
        $material->load(['questions' => function ($query) {
            $query->with(['mcqOptions', 'tfStatement', 'matchingPairs']);
        }]);

        return response()->json($material);
    }

    /**
     * Update the specified material in storage.
     */
    public function update(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
            'is_active' => 'boolean'
        ]);

        // Handle file upload
        if ($request->hasFile('pdf_file')) {
            // Delete old file if exists
            if ($material->pdf_path && Storage::disk('public')->exists($material->pdf_path)) {
                Storage::disk('public')->delete($material->pdf_path);
            }

            $file = $request->file('pdf_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $validated['pdf_path'] = $file->storeAs('materials', $filename, 'public');
        }

        $material->update($validated);

        return response()->json([
            'message' => 'Material updated successfully',
            'material' => $material
        ]);
    }

    /**
     * Remove the specified material from storage.
     */
    public function destroy(Material $material): JsonResponse
    {
        // Check if material has questions
        if ($material->questions()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete material that has questions. Please delete all questions first.'
            ], 422);
        }

        // Delete PDF file if exists
        if ($material->pdf_path && Storage::disk('public')->exists($material->pdf_path)) {
            Storage::disk('public')->delete($material->pdf_path);
        }

        $material->delete();

        return response()->json([
            'message' => 'Material deleted successfully'
        ]);
    }

    /**
     * Get materials with question counts.
     */
    public function withQuestionCounts(): JsonResponse
    {
        $materials = Material::withCount('questions')
                            ->where('is_active', true)
                            ->orderBy('created_at', 'desc')
                            ->get();

        return response()->json($materials);
    }
}