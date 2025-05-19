<?php
// Ensure these headers are the VERY FIRST lines output by this script.
// This is crucial for CORS to work.
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Allow requests from your Vite development server
    header("Access-Control-Allow-Origin: http://localhost:5173");
} else {
    // Fallback or allow all - for broader testing, but be specific in production
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true"); // If you plan to use cookies/sessions

// Handle OPTIONS pre-flight request (important for CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204); // No Content for OPTIONS
    exit();
}

// Set Content-Type for actual response AFTER handling OPTIONS
header("Content-Type: application/json; charset=UTF-8");

// Error reporting - useful for development
error_reporting(E_ALL); 
ini_set('display_errors', 1);

// Now require Database.php. Its own header calls might be redundant if they are identical,
// but PHP handles redundant identical header calls gracefully.
// If Database.php sets different headers, the ones set last for a given header type will usually take precedence.
require_once 'Database.php'; 

// Get user IDs from the query parameters
$user1_id = isset($_GET['user1_id']) ? intval($_GET['user1_id']) : 0;
$user2_id = isset($_GET['user2_id']) ? intval($_GET['user2_id']) : 0;

// Validate user IDs
if ($user1_id <= 0 || $user2_id <= 0) {
    http_response_code(400); // Bad Request
    // The Content-Type header is already set above
    echo json_encode(['success' => false, 'message' => 'Valid user IDs are required.']);
    exit();
}

try {
    // Prepare SQL statement to fetch messages between the two users
    $stmt = $conn->prepare("SELECT id, sender_id, receiver_id, message_content, created_at FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC");
    if ($stmt === false) {
        // Handle prepare statement error
        http_response_code(500);
        error_log("SQL Prepare Error in get_messages.php: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Database prepare statement failed: ' . htmlspecialchars($conn->error)]);
        exit();
    }

    $stmt->bind_param("iiii", $user1_id, $user2_id, $user2_id, $user1_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        // Ensure data types are correct for JSON response
        $row['id'] = (int)$row['id'];
        $row['sender_id'] = (int)$row['sender_id'];
        $row['receiver_id'] = (int)$row['receiver_id'];
        $messages[] = $row;
    }
    $stmt->close();

    // Send successful response with messages
    http_response_code(200); // OK
    echo json_encode(['success' => true, 'messages' => $messages]);

} catch (Exception $e) {
    // Handle any other exceptions
    http_response_code(500); // Internal Server Error
    error_log("Exception in get_messages.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred while fetching messages: ' . htmlspecialchars($e->getMessage())]);
}

// The connection is closed automatically when the script ends if $conn was established by Database.php
// If you establish $conn within this script and not via include, you'd close it here: $conn->close();
?>
