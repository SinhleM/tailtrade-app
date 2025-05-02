<?php
// Include database connection and CORS headers
require_once 'Database.php'; // Make sure the path is correct

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("success" => false, "message" => "Only POST method is allowed"));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Basic Validation - Check if required fields exist
if (!isset($data->id) || !isset($data->name) || empty(trim($data->name))) {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => "User ID and Name are required"));
    exit();
}

// Sanitize inputs
$user_id = intval($data->id);
$name = htmlspecialchars(strip_tags(trim($data->name)));
$new_password = null; // Initialize password variable

// --- Password Update Logic ---
$update_password = false;
if (isset($data->newPassword) && !empty(trim($data->newPassword))) {
    // If new password is provided, current password must also be provided
    if (!isset($data->currentPassword) || empty(trim($data->currentPassword))) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Current password is required to set a new password"));
        exit();
    }

    // Validate new password length
    $password_length = strlen(trim($data->newPassword));
    if ($password_length < 8 || $password_length > 16) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "New password must be between 8 and 16 characters"));
        exit();
    }

    $current_password_input = trim($data->currentPassword);
    $new_password_input = trim($data->newPassword);

    // Fetch current hashed password from DB
    try {
        $fetch_query = "SELECT password FROM users WHERE id = :id LIMIT 1";
        $fetch_stmt = $conn->prepare($fetch_query);
        $fetch_stmt->bindParam(":id", $user_id, PDO::PARAM_INT);
        $fetch_stmt->execute();

        $user = $fetch_stmt->fetch(); // Fetch as associative array (default from Database.php)

        if (!$user) {
            http_response_code(404); // Not Found
            echo json_encode(array("success" => false, "message" => "User not found"));
            exit();
        }

        // Verify current password
        if (password_verify($current_password_input, $user['password'])) {
            // Current password is correct, hash the new one
            $new_password = password_hash($new_password_input, PASSWORD_DEFAULT);
            $update_password = true;
        } else {
            // Incorrect current password
            http_response_code(401); // Unauthorized (or 400 Bad Request)
            echo json_encode(array("success" => false, "message" => "Incorrect current password"));
            exit();
        }

    } catch (PDOException $e) {
        http_response_code(500);
        // error_log("Database error during password fetch in update_profile.php: " . $e->getMessage());
        echo json_encode(array("success" => false, "message" => "An internal error occurred while verifying password."));
        // Optionally add debug message: "debug_message" => $e->getMessage()
        exit();
    }
}

// --- Prepare and Execute Update Query ---
try {
    // Base query
    $query = "UPDATE users SET name = :name";

    // Add password update if applicable
    if ($update_password) {
        $query .= ", password = :password";
    }

    // Add WHERE clause
    $query .= " WHERE id = :id";

    // Prepare the statement
    $stmt = $conn->prepare($query);

    // Bind parameters
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":id", $user_id, PDO::PARAM_INT);
    if ($update_password) {
        $stmt->bindParam(":password", $new_password);
    }

    // Execute the query
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200); // OK
            echo json_encode(array(
                "success" => true,
                "message" => "Profile updated successfully"
            ));
        } else {
             // Query executed successfully, but no rows were affected
             // This might happen if the submitted name was the same as the existing name
             // and no password change was requested, or if the user ID didn't exist (though we checked earlier for password).
             http_response_code(200); // Still OK, just inform no changes made maybe? Or treat as success.
             echo json_encode(array(
                "success" => true, // Or false depending on desired behaviour
                "message" => "Profile updated (or no changes needed)"
            ));
        }
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("success" => false, "message" => "Unable to update profile"));
    }

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    // error_log("Database error during profile update in update_profile.php: " . $e->getMessage());
    echo json_encode(array("success" => false, "message" => "An internal error occurred during profile update."));
    // Optionally add debug message: "debug_message" => $e->getMessage()
}

?>