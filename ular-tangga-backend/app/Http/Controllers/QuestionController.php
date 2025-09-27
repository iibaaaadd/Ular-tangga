<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\McqOption;
use App\Models\TfStatement;
use App\Models\MatchingPair;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Question::with(['creator', 'mcqOptions', 'tfStatement', 'matchingPairs']);

            // Filter by subtype if provided
            if ($request->has('subtype')) {
                $query->where('subtype', $request->subtype);
            }

            // Filter by difficulty if provided  
            if ($request->has('difficulty')) {
                $query->where('difficulty', $request->difficulty);
            }

            // Filter by creator if provided
            if ($request->has('created_by')) {
                $query->where('created_by', $request->created_by);
            }

            // Get pagination parameters
            $perPage = $request->get('per_page', 10);
            $page = $request->get('page', 1);

            // Apply pagination
            $questions = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $questions->items(),
                'meta' => [
                    'current_page' => $questions->currentPage(),
                    'per_page' => $questions->perPage(),
                    'total' => $questions->total(),
                    'last_page' => $questions->lastPage(),
                    'from' => $questions->firstItem(),
                    'to' => $questions->lastItem(),
                    'has_more_pages' => $questions->hasMorePages()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch questions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validation rules
            $rules = [
                'prompt' => 'required|string|max:1000',
                'difficulty' => 'required|in:easy,medium,hard',
                'subtype' => 'required|in:mcq,true_false,matching'
            ];

            // Additional validation based on subtype
            if ($request->subtype === 'mcq') {
                $rules['options'] = 'required|array|min:2|max:6';
                $rules['options.*'] = 'required|string|max:255';
                $rules['correct_option_index'] = 'required|integer|min:0|max:5';
            } elseif ($request->subtype === 'true_false') {
                $rules['is_true'] = 'required|boolean';
            } elseif ($request->subtype === 'matching') {
                $rules['pairs'] = 'required|array|min:2|max:10';
                $rules['pairs.*.left_item'] = 'required|string|max:255';
                $rules['pairs.*.right_item'] = 'required|string|max:255';
                $rules['pairs.*.is_correct'] = 'required|boolean';
                $rules['pairs.*.order'] = 'integer|min:0';
            }

            $validated = $request->validate($rules);

            DB::beginTransaction();

            // Set base_score based on difficulty
            $baseScore = match($validated['difficulty']) {
                'easy' => 10,
                'medium' => 20,
                'hard' => 30,
                default => 10
            };

            // Create the question
            $question = Question::create([
                'prompt' => $validated['prompt'],
                'difficulty' => $validated['difficulty'],
                'base_score' => $baseScore,
                'subtype' => $validated['subtype'],
                'created_by' => Auth::id()
            ]);

            // Handle different subtypes
            switch ($validated['subtype']) {
                case 'mcq':
                    // Create MCQ options
                    foreach ($validated['options'] as $index => $optionText) {
                        McqOption::create([
                            'question_id' => $question->id,
                            'option_text' => $optionText,
                            'is_correct' => $index == $validated['correct_option_index']
                        ]);
                    }
                    break;

                case 'true_false':
                    TfStatement::create([
                        'question_id' => $question->id,
                        'is_true' => $validated['is_true']
                    ]);
                    break;

                case 'matching':
                    foreach ($validated['pairs'] as $index => $pair) {
                        MatchingPair::create([
                            'question_id' => $question->id,
                            'left_item' => $pair['left_item'],
                            'right_item' => $pair['right_item'],
                            'is_correct' => $pair['is_correct'],
                            'order' => $pair['order'] ?? $index + 1
                        ]);
                    }
                    break;
            }

            DB::commit();

            // Load relationships for response
            $question->load(['creator', 'mcqOptions', 'tfStatement', 'matchingPairs']);

            return response()->json([
                'success' => true,
                'message' => 'Question created successfully',
                'data' => $question
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create question: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $question = Question::with(['creator', 'mcqOptions', 'tfStatement', 'matchingPairs'])
                              ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $question
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $question = Question::findOrFail($id);

            // Validation rules
            $rules = [
                'prompt' => 'required|string|max:1000',
                'difficulty' => 'required|in:easy,medium,hard',
                'subtype' => 'required|in:mcq,true_false,matching'
            ];

            // Additional validation based on subtype
            if ($request->subtype === 'mcq') {
                $rules['options'] = 'required|array|min:2|max:6';
                $rules['options.*'] = 'required|string|max:255';
                $rules['correct_option_index'] = 'required|integer|min:0|max:5';
            } elseif ($request->subtype === 'true_false') {
                $rules['is_true'] = 'required|boolean';
            } elseif ($request->subtype === 'matching') {
                $rules['pairs'] = 'required|array|min:2|max:10';
                $rules['pairs.*.left_item'] = 'required|string|max:255';
                $rules['pairs.*.right_item'] = 'required|string|max:255';
                $rules['pairs.*.is_correct'] = 'required|boolean';
                $rules['pairs.*.order'] = 'integer|min:0';
            }

            $validated = $request->validate($rules);

            DB::beginTransaction();

            // Set base_score based on difficulty
            $baseScore = match($validated['difficulty']) {
                'easy' => 10,
                'medium' => 20,
                'hard' => 30,
                default => 10
            };

            // Update the question
            $question->update([
                'prompt' => $validated['prompt'],
                'difficulty' => $validated['difficulty'],
                'base_score' => $baseScore,
                'subtype' => $validated['subtype']
            ]);

            // Clear existing relations
            $question->mcqOptions()->delete();
            $question->tfStatement()->delete();
            $question->matchingPairs()->delete();

            // Handle different subtypes
            switch ($validated['subtype']) {
                case 'mcq':
                    foreach ($validated['options'] as $index => $optionText) {
                        McqOption::create([
                            'question_id' => $question->id,
                            'option_text' => $optionText,
                            'is_correct' => $index == $validated['correct_option_index']
                        ]);
                    }
                    break;

                case 'true_false':
                    TfStatement::create([
                        'question_id' => $question->id,
                        'is_true' => $validated['is_true']
                    ]);
                    break;

                case 'matching':
                    foreach ($validated['pairs'] as $index => $pair) {
                        MatchingPair::create([
                            'question_id' => $question->id,
                            'left_item' => $pair['left_item'],
                            'right_item' => $pair['right_item'],
                            'is_correct' => $pair['is_correct'],
                            'order' => $pair['order'] ?? $index + 1
                        ]);
                    }
                    break;
            }

            DB::commit();

            // Load relationships for response
            $question->load(['creator', 'mcqOptions', 'tfStatement', 'matchingPairs']);

            return response()->json([
                'success' => true,
                'message' => 'Question updated successfully',
                'data' => $question
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update question: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $question = Question::findOrFail($id);
            
            DB::beginTransaction();
            
            // Delete related records (cascade delete should handle this, but let's be explicit)
            $question->mcqOptions()->delete();
            $question->tfStatement()->delete();
            $question->matchingPairs()->delete();
            
            // Delete the question
            $question->delete();
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Question deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete question: ' . $e->getMessage()
            ], 500);
        }
    }
}
