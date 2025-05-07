<?php
require 'Database.php'; // Includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Basic Validation (expand as needed)
$requiredFields = ['owner_id', 'name', 'condition', 'price', 'location', 'description', 'image_url'];
foreach ($requiredFields as $field) {
    // Allow 0 for price but check if it exists and is numeric if provided
     if ($field === 'price') {
         if (!isset($input[$field]) || !is_numeric($input[$field]) || $input[$field] < 0) {
              http_response_code(400);
              echo json_encode(['success' => false, 'message' => "Invalid or missing field: $field"]);
              exit();
         }
     } elseif (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit();
    }
}

$owner_id = (int)$input['owner_id']; // Make sure it's an integer
$name = $conn->real_escape_string($input['name']);
$condition = $conn->real_escape_string($input['condition']); // 'new', 'like-new', 'good', 'fair', 'used'
$price = (float)$input['price']; // Ensure price is float/decimal
$location = $conn->real_escape_string($input['location']);
$description = $conn->real_escape_string($input['description']);
$image_url = $conn->real_escape_string($input['image_url']); // Consider URL validation
$createdAt = date('Y-m-d H:i:s');

// --- Check if owner_id exists in users table ---
$stmtCheck = $conn->prepare("SELECT id FROM users WHERE id = ?");
if ($stmtCheck === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error (check owner): ' . $conn->error]);
     exit();
}
$stmtCheck->bind_param("i", $owner_id);
$stmtCheck->execute();
$stmtCheck->store_result();
if ($stmtCheck->num_rows === 0) {
    http_response_code(400); // Bad Request or 404 Not Found depending on context
    echo json_encode(['success' => false, 'message' => 'Invalid owner ID.']);
    $stmtCheck->close();
    $conn->close();
    exit();
}
$stmtCheck->close();

// --- Insert Pet Supply ---
$stmtInsert = $conn->prepare("INSERT INTO pet_supplies (owner_id, name, `condition`, price, location, description, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
if ($stmtInsert === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error (insert supply): ' . $conn->error]);
     exit();
}
$stmtInsert->bind_param("issdssss", $owner_id, $name, $condition, $price, $location, $description, $image_url, $createdAt);

if ($stmtInsert->execute()) {
    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Pet supply/item listed successfully!']);
} else {
    http_response_code(500);
    error_log('Pet supply listing failed: ' . $stmtInsert->error);
    echo json_encode(['success' => false, 'message' => 'Failed to list pet supply/item. Please try again.']);
}

$stmtInsert->close();
$conn->close();
?>