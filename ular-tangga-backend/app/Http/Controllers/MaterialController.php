<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
        Log::info('Update request received', [
            'method' => $request->method(),
            'id' => $material->id,
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
            'headers' => $request->headers->all(),
        ]);
        
        // Validate input
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'sometimes'
        ]);
        
        Log::info('Validation passed', ['validated' => $validated]);
        
        // Handle is_active conversion
        if ($request->has('is_active')) {
            $isActiveValue = $request->get('is_active');
            $validated['is_active'] = in_array($isActiveValue, ['1', 1, true, 'true'], true);
            Log::info('is_active processed', [
                'original' => $isActiveValue,
                'converted' => $validated['is_active']
            ]);
        }

        // Handle file upload
        if ($request->hasFile('pdf_file')) {
            Log::info('Processing file upload');
            
            // Delete old file if exists
            if ($material->pdf_path && Storage::disk('public')->exists($material->pdf_path)) {
                Storage::disk('public')->delete($material->pdf_path);
                Log::info('Old file deleted', ['path' => $material->pdf_path]);
            }

            $file = $request->file('pdf_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $validated['pdf_path'] = $file->storeAs('materials', $filename, 'public');
            
            Log::info('New file uploaded', ['path' => $validated['pdf_path']]);
        } else {
            // Keep existing PDF path if no new file uploaded
            if ($material->pdf_path) {
                $validated['pdf_path'] = $material->pdf_path;
                Log::info('Keeping existing file', ['path' => $material->pdf_path]);
            }
        }

        Log::info('Before update', [
            'material_before' => $material->toArray(),
            'data_to_update' => $validated
        ]);

        // Update the material
        $updated = $material->update($validated);
        
        // Refresh to get latest data
        $material->refresh();
        
        Log::info('After update', [
            'update_result' => $updated,
            'material_after' => $material->toArray()
        ]);

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
        try {
            // Get the count of related questions for logging
            $questionCount = $material->questions()->count();
            
            // Delete PDF file if exists
            if ($material->pdf_path && Storage::disk('public')->exists($material->pdf_path)) {
                Storage::disk('public')->delete($material->pdf_path);
            }

            // Delete material (cascade will automatically delete related questions)
            $material->delete();

            $message = $questionCount > 0 
                ? "Material and {$questionCount} related questions deleted successfully"
                : 'Material deleted successfully';

            return response()->json([
                'message' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting material', [
                'material_id' => $material->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error occurred while deleting material'
            ], 500);
        }
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