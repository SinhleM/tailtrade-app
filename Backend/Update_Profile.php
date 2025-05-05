<?php
require 'Database.php'; // Includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Basic Validation
if (empty($input['id']) || empty($input['name'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'User ID and Name are required.']);
    exit();
}

$userId = (int)$input['id'];
$newName = $conn->real_escape_string($input['name']);
$updatePassword = false;
$currentPassword = null;
$newPassword = null;

// Check if password update is requested
if (!empty($input['newPassword'])) {
    if (empty($input['currentPassword'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is required to set a new password.']);
        exit();
    }
     if (strlen($input['newPassword']) < 8 || strlen($input['newPassword']) > 16) { // Password length check [cite: 155]
         http_response_code(400);
         echo json_encode(['success' => false, 'message' => 'New password must be between 8 and 16 characters.']);
         exit();
     }
    $updatePassword = true;
    $currentPassword = $input['currentPassword'];
    $newPassword = $input['newPassword'];
}

// --- Fetch current user data (including password hash) ---
$stmtFetch = $conn->prepare("SELECT password FROM users WHERE id = ?");
if ($stmtFetch === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error (fetch user): ' . $conn->error]);
     exit();
}
$stmtFetch->bind_param("i", $userId);
$stmtFetch->execute();
$result = $stmtFetch->get_result();

if ($result->num_rows !== 1) {
    http_response_code(404); // Not Found
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    $stmtFetch->close();
    $conn->close();
    exit();
}
$user = $result->fetch_assoc();
$stmtFetch->close();

$currentHashedPassword = $user['password'];
$newHashedPassword = null;

// --- If updating password, verify current password and hash new one ---
if ($updatePassword) {
    if (!password_verify($currentPassword, $currentHashedPassword)) {
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Incorrect current password.']);
        $conn->close();
        exit();
    }
    // Hash the new password
    $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
     if ($newHashedPassword === false) {
         http_response_code(500);
         echo json_encode(['success' => false, 'message' => 'Failed to hash new password.']);
         exit();
     }
}

// --- Prepare Update Statement ---
$sql = "UPDATE users SET name = ?, updated_at = NOW()";
$types = "si"; // s for name, i for id
$params = [&$newName]; // Start with name

if ($updatePassword && $newHashedPassword) {
    $sql .= ", password = ?";
    $types .= "s"; // Add type for password
    $params[] = &$newHashedPassword; // Add new hashed password to params
}
$sql .= " WHERE id = ?";
$params[] = &$userId; // Add id to params (always last)

$stmtUpdate = $conn->prepare($sql);
if ($stmtUpdate === false) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database prepare error (update profile): ' . $conn->error]);
     exit();
}

// Dynamically bind parameters
call_user_func_array([$stmtUpdate, 'bind_param'], array_merge([$types], $params));


// --- Execute Update ---
if ($stmtUpdate->execute()) {
    if ($stmtUpdate->affected_rows > 0) {
        http_response_code(200); // OK
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully!']);
    } else {
        // No rows affected could mean the data was the same, or user ID was wrong (though checked earlier)
        http_response_code(200); // Still OK, but maybe a different message
        echo json_encode(['success' => true, 'message' => 'Profile data submitted, no changes detected.']);
    }
} else {
    http_response_code(500);
    error_log('Profile update failed: ' . $stmtUpdate->error);
    echo json_encode(['success' => false, 'message' => 'Failed to update profile. Please try again.']);
}

$stmtUpdate->close();
$conn->close();
?>