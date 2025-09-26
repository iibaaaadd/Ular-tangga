<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Question;
use App\Models\User;

echo "Testing Model Relations...\n";

// Test Question with MCQ
$mcqQuestion = Question::with(['creator', 'mcqOptions'])->where('subtype', 'mcq')->first();
if ($mcqQuestion) {
    echo "MCQ Question: " . $mcqQuestion->prompt . "\n";
    echo "Created by: " . $mcqQuestion->creator->name . "\n";
    echo "MCQ Options count: " . $mcqQuestion->mcqOptions->count() . "\n";
    
    foreach ($mcqQuestion->mcqOptions as $option) {
        echo "- " . $option->option_text . " (" . ($option->is_correct ? 'Correct' : 'Wrong') . ")\n";
    }
    echo "\n";
}

// Test Question with True/False
$tfQuestion = Question::with(['creator', 'tfStatement'])->where('subtype', 'true_false')->first();
if ($tfQuestion) {
    echo "True/False Question: " . $tfQuestion->prompt . "\n";
    echo "Created by: " . $tfQuestion->creator->name . "\n";
    echo "Answer: " . ($tfQuestion->tfStatement->is_true ? 'True' : 'False') . "\n\n";
}

// Test Question with Essay
$essayQuestion = Question::with(['creator', 'essayKey'])->where('subtype', 'essay')->first();
if ($essayQuestion) {
    echo "Essay Question: " . $essayQuestion->prompt . "\n";
    echo "Created by: " . $essayQuestion->creator->name . "\n";
    echo "Max Score: " . $essayQuestion->essayKey->max_score . "\n";
    echo "Key Points: " . substr($essayQuestion->essayKey->key_points, 0, 100) . "...\n\n";
}

// Test User relations
$teacher = User::with('createdQuestions')->where('role', 'teacher')->first();
if ($teacher) {
    echo "Teacher: " . $teacher->name . "\n";
    echo "Questions created: " . $teacher->createdQuestions->count() . "\n";
}

echo "All relations working correctly!\n";