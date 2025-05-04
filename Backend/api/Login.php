<?php
// Include database connection
require_once 'Database.php'; // <-- Corrected path

// Only allow POST requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("success" => false, "message" => "Only POST method is allowed"));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is complete
if (!isset($data->email) || !isset($data->password) || empty(trim($data->email)) || empty(trim($data->password))) {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => "Email and password are required"));
    exit();
}

// Sanitize input data
$email = htmlspecialchars(strip_tags(trim($data->email)));
$password = trim($data->password);

// SQL query to check if the user exists
$query = "SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1";

try {
    // Prepare the query
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();

    // Check if user exists
    if ($stmt->rowCount() > 0) {
        // Get the user record
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify password
        if (password_verify($password, $user['password'])) {
            // Create user data array (excluding password)
            $user_data = array(
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "role" => $user['role']
            );

            // Set response
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Login successful",
                "user" => $user_data
            ));
        } else {
            // Password does not match
            http_response_code(401); // Unauthorized
            echo json_encode(array(
                "success" => false,
                "message" => "Invalid credentials"
            ));
        }
    } else {
        // User not found
        http_response_code(401); // Unauthorized
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid credentials"
        ));
    }
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    // Log the error properly in production instead of echoing
    error_log("Login Error: " . $e->getMessage());
    echo json_encode(array("success" => false, "message" => "Database error during login."));
    // echo json_encode(array("success" => false, "message" => "Database error: " . $e->getMessage())); // For debugging only
}
?>