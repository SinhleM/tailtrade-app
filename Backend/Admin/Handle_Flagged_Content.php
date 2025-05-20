<?php
require 'Database.php'; // This includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$response = ['success' => false, 'message' => ''];

// Basic validation
if (empty($input['itemId']) || empty($input['itemType']) || empty($input['action'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Item ID, type, and action are required.']);
    exit();
}

$itemId = (int)$input['itemId'];
$itemType = $conn->real_escape_string($input['itemType']);
$action = $conn->real_escape_string($input['action']);

// Validate item type
$validTypes = ['user', 'pet', 'supply'];
if (!in_array($itemType, $validTypes)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid item type.']);
    exit();
}

// Validate action
$validActions = ['dismiss', 'remove'];
if (!in_array($action, $validActions)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid action. Must be "dismiss" or "remove".']);
    exit();
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    if ($action === 'remove') {
        // Remove the content based on type
        switch ($itemType) {
            case 'user':
                // Use the delete_user.php functionality
                $deleteUserStmt = $conn->prepare("DELETE FROM users WHERE id = ?");
                $deleteUserStmt->bind_param("i", $itemId);
                $deleteUserStmt->execute();
                $deleteUserStmt->close();
                break;
                
            case 'pet':
                // Delete pet listing
                $deletePetStmt = $conn->prepare("DELETE FROM pets WHERE id = ?");
                $deletePetStmt->bind_param("i", $itemId);
                $deletePetStmt->execute();
                $deletePetStmt->close();
                break;
                
            case 'supply':
                // Delete supply listing
                $deleteSupplyStmt = $conn->prepare("DELETE FROM pet_supplies WHERE id = ?");
                $deleteSupplyStmt->bind_param("i", $itemId);
                $deleteSupplyStmt->execute();
                $deleteSupplyStmt->close();
                break;
        }
    }
    
    // Update the reported_content status to 'resolved'
    $updateStmt = $conn->prepare("UPDATE reported_content SET status = 'resolved' WHERE item_id = ? AND item_type = ?");
    $updateStmt->bind_param("is", $itemId, $itemType);
    
    if ($updateStmt->execute()) {
        if ($updateStmt->affected_rows > 0) {
            // Commit the transaction
            $conn->commit();
            
            $response['success'] = true;
            $response['message'] = $action === 'dismiss' 
                ? 'Flag dismissed successfully.' 
                : 'Content removed and flag resolved successfully.';
            http_response_code(200);
        } else {
            // Flag not found
            $conn->rollback();
            $response['message'] = 'Flag not found.';
            http_response_code(404);
        }
    } else {
        // Error occurred
        $conn->rollback();
        $response['message'] = 'Error handling flagged content: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in handle_flagged_content.php: ' . $conn->error);
    }
    
    $updateStmt->close();

} catch (Exception $e) {
    // Roll back transaction on error
    $conn->rollback();
    
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in handle_flagged_content.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>