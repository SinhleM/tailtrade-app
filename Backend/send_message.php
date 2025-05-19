<?php
// Ensure this is the VERY FIRST THING
require_once 'Database.php'; // Sets CORS headers and Content-Type json

// The rest of your script's logic was here, it should be fine if Database.php is correctly included and working.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'POST method required.']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$sender_id = isset($data['sender_id']) ? intval($data['sender_id']) : 0;
$receiver_id = isset($data['receiver_id']) ? intval($data['receiver_id']) : 0;
$message_content = isset($data['message_content']) ? trim($data['message_content']) : '';

if ($sender_id <= 0 || $receiver_id <= 0 || empty($message_content)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Sender ID, Receiver ID, and message content are required.']);
    exit();
}

if ($sender_id === $receiver_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Sender and receiver cannot be the same user.']);
    exit();
}

try {
    $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message_content) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $sender_id, $receiver_id, $message_content);

    if ($stmt->execute()) {
        $new_message_id = $stmt->insert_id;
        echo json_encode(['success' => true, 'message' => 'Message sent successfully.', 'message_id' => $new_message_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send message.']);
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log('Error sending message: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An internal error occurred. Please try again later.']);
}

$conn->close();
?>