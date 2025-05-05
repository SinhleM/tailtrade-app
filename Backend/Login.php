<?php
require 'Database.php'; // Includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit();
}

$email = $conn->real_escape_string($input['email']);
$password = $input['password']; // Raw password input

// --- Find User by Email ---
// Select the hashed password along with other details
$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
if ($stmt === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error: ' . $conn->error]);
     exit();
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // --- Verify Password ---
    if (password_verify($password, $user['password'])) {
        // Password matches!
        // Remove password hash before sending user data back to frontend
        unset($user['password']);

        http_response_code(200); // OK
        echo json_encode(['success' => true, 'message' => 'Login successful!', 'user' => $user]);
    } else {
        // Password does not match
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }
} else {
    // User not found
    http_response_code(401); // Unauthorized
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
}

$stmt->close();
$conn->close();
?>