<?php
require '../Database.php'; // This includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$response = ['success' => false, 'message' => ''];

// Basic validation
if (empty($input['userId'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'User ID is required.']);
    exit();
}

$userId = (int)$input['userId'];

try {
    // Start transaction to ensure all operations succeed or fail together
    $conn->begin_transaction();

    // First, check if there are any listings associated with this user
    // We'll need to handle these first (delete or reassign)
    $checkListingsSql = "
        SELECT COUNT(*) as pet_count FROM pets WHERE owner_id = ?
        UNION ALL
        SELECT COUNT(*) as supply_count FROM pet_supplies WHERE owner_id = ?
    ";
    
    $checkStmt = $conn->prepare($checkListingsSql);
    $checkStmt->bind_param("ii", $userId, $userId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    $petCount = 0;
    $supplyCount = 0;
    
    if ($row = $result->fetch_assoc()) {
        $petCount = (int)$row['pet_count'];
    }
    
    if ($row = $result->fetch_assoc()) {
        $supplyCount = (int)$row['supply_count'];
    }
    
    $checkStmt->close();
    
    // If user has listings, delete them first
    if ($petCount > 0) {
        // Delete pet listings
        $deleteListingsStmt = $conn->prepare("DELETE FROM pets WHERE owner_id = ?");
        $deleteListingsStmt->bind_param("i", $userId);
        $deleteListingsStmt->execute();
        $deleteListingsStmt->close();
    }
    
    if ($supplyCount > 0) {
        // Delete supply listings
        $deleteSuppliesStmt = $conn->prepare("DELETE FROM pet_supplies WHERE owner_id = ?");
        $deleteSuppliesStmt->bind_param("i", $userId);
        $deleteSuppliesStmt->execute();
        $deleteSuppliesStmt->close();
    }
    
    // Delete any messages associated with the user
    $deleteMessagesStmt = $conn->prepare("DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?");
    $deleteMessagesStmt->bind_param("ii", $userId, $userId);
    $deleteMessagesStmt->execute();
    $deleteMessagesStmt->close();
    
    // Delete any reports made by or about the user
    $deleteReportsStmt = $conn->prepare("DELETE FROM reported_content WHERE reporter_id = ? OR (item_id = ? AND item_type = 'user')");
    $deleteReportsStmt->bind_param("ii", $userId, $userId);
    $deleteReportsStmt->execute();
    $deleteReportsStmt->close();
    
    // Finally, delete the user
    $deleteUserStmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $deleteUserStmt->bind_param("i", $userId);
    
    if ($deleteUserStmt->execute()) {
        if ($deleteUserStmt->affected_rows > 0) {
            // Commit the transaction
            $conn->commit();
            
            $response['success'] = true;
            $response['message'] = 'User and all associated data deleted successfully.';
            http_response_code(200);
        } else {
            // User not found
            $conn->rollback();
            $response['message'] = 'User not found.';
            http_response_code(404);
        }
    } else {
        // Error occurred
        $conn->rollback();
        $response['message'] = 'Error deleting user: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in delete_user.php: ' . $conn->error);
    }
    
    $deleteUserStmt->close();

} catch (Exception $e) {
    // Make sure to roll back the transaction on error
    $conn->rollback();
    
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in delete_user.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>