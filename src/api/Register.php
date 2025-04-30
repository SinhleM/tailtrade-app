<?php
// Include database connection
require_once 'config/database.php';

// Only allow POST requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("success" => false, "message" => "Only POST method is allowed"));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is complete
if (
    !isset($data->name) || !isset($data->email) || !isset($data->password) || !isset($data->role) ||
    empty(trim($data->name)) || empty(trim($data->email)) || empty(trim($data->password))
) {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => "All fields are required"));
    exit();
}

// Validate email format
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => "Invalid email format"));
    exit();
}

// Validate password length
if (strlen($data->password) < 8 || strlen($data->password) > 16) {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => "Password must be between 8 and 16 characters"));
    exit();
}

// Validate role
$allowedRoles = ['admin', 'customer'];
if (!in_array($data->role, $allowedRoles)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => "Invalid role"));
    exit();
}

// Sanitize input data
$name = htmlspecialchars(strip_tags(trim($data->name)));
$email = htmlspecialchars(strip_tags(trim($data->email)));
$password = trim($data->password);
$role = htmlspecialchars(strip_tags(trim($data->role)));

// Check if email already exists
$check_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
$check_stmt = $conn->prepare($check_query);
$check_stmt->bindParam(":email", $email);
$check_stmt->execute();

if ($check_stmt->rowCount() > 0) {
    http_response_code(409); // Conflict
    echo json_encode(array("success" => false, "message" => "Email already exists"));
    exit();
}

// Hash the password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// SQL query to insert new user
$query = "INSERT INTO users (name, email, password, role, created_at) VALUES (:name, :email, :password, :role, NOW())";

try {
    // Prepare the query
    $stmt = $conn->prepare($query);
    
    // Bind parameters
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $hashed_password);
    $stmt->bindParam(":role", $role);
    
    // Execute the query
    if ($stmt->execute()) {
        $user_id = $conn->lastInsertId();
        
        // Create user data array (excluding password)
        $user_data = array(
            "id" => $user_id,
            "name" => $name,
            "email" => $email,
            "role" => $role
        );
        
        // Set response
        http_response_code(201); // Created
        echo json_encode(array(
            "success" => true,
            "message" => "User registered successfully",
            "user" => $user_data
        ));
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("success" => false, "message" => "Unable to register user"));
    }
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("success" => false, "message" => "Database error: " . $e->getMessage()));
}
?>