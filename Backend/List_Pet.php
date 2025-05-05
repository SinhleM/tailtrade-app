<?php
require 'Database.php'; // Includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Basic Validation (expand as needed)
$requiredFields = ['owner_id', 'name', 'type', 'breed', 'age', 'price', 'location', 'description', 'image_url'];
foreach ($requiredFields as $field) {
    // Allow 0 for age/price but check if they exist and are numeric if provided
     if ($field === 'age' || $field === 'price') {
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
$type = $conn->real_escape_string($input['type']); // 'dog' or 'cat' [cite: 3]
$breed = $conn->real_escape_string($input['breed']);
$age = (int)$input['age'];
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


// --- Insert Pet ---
$stmtInsert = $conn->prepare("INSERT INTO pets (owner_id, name, type, breed, age, price, location, description, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
if ($stmtInsert === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error (insert pet): ' . $conn->error]);
     exit();
}
$stmtInsert->bind_param("isssidsiss", $owner_id, $name, $type, $breed, $age, $price, $location, $description, $image_url, $createdAt);

if ($stmtInsert->execute()) {
    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Pet listed successfully!']);
} else {
    http_response_code(500);
    error_log('Pet listing failed: ' . $stmtInsert->error);
    echo json_encode(['success' => false, 'message' => 'Failed to list pet. Please try again.']);
}

$stmtInsert->close();
$conn->close();
?>