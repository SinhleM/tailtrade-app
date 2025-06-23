<?php
require 'Database.php'; // Includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (empty($input['name']) || empty($input['email']) || empty($input['password']) || empty($input['role'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit();
}

$name = $conn->real_escape_string($input['name']);
$email = $conn->real_escape_string($input['email']);
$password = $input['password']; // Get raw password
$role = $conn->real_escape_string($input['role']); // 'customer' or 'admin'

// --- Password Hashing ---
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
if ($hashedPassword === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to hash password.']);
    exit();
}

$createdAt = date('Y-m-d H:i:s'); // Current timestamp

// --- Check if email already exists ---
$stmtCheck = $conn->prepare("SELECT id FROM users WHERE email = ?");
if ($stmtCheck === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error (check email): ' . $conn->error]);
     exit();
}
$stmtCheck->bind_param("s", $email);
$stmtCheck->execute();
$stmtCheck->store_result();

if ($stmtCheck->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(['success' => false, 'message' => 'Email already registered.']);
    $stmtCheck->close();
    $conn->close();
    exit();
}
$stmtCheck->close();

// --- Insert User ---
$stmtInsert = $conn->prepare("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)");
if ($stmtInsert === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error (insert user): ' . $conn->error]);
     exit();
}
// Use the hashed password here
$stmtInsert->bind_param("sssss", $name, $email, $hashedPassword, $role, $createdAt);

if ($stmtInsert->execute()) {
    $userId = $conn->insert_id; // Get the ID of the newly inserted user

    // --- Fetch the newly created user (excluding password) ---
    $stmtFetch = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
     if ($stmtFetch === false) {
         // Log error, but registration was technically successful
         error_log('Database prepare error (fetch user after registration): ' . $conn->error);
         echo json_encode(['success' => true, 'message' => 'Registration successful, but failed to fetch user details.', 'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => $role]]);
     } else {
        $stmtFetch->bind_param("i", $userId);
        $stmtFetch->execute();
        $result = $stmtFetch->get_result();
        $user = $result->fetch_assoc();
        $stmtFetch->close();

        http_response_code(201); // Created
        echo json_encode(['success' => true, 'message' => 'Registration successful!', 'user' => $user]);
     }
} else {
    http_response_code(500);
    // Provide more specific error in logs, generic to user
    error_log('Registration failed: ' . $stmtInsert->error);
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

$stmtInsert->close();
$conn->close();
?>