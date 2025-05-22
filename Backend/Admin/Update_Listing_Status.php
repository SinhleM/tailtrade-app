<?php
require '../Database.php'; // This includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$response = ['success' => false, 'message' => ''];

// Basic validation
if (empty($input['listingId']) || empty($input['listingType']) || empty($input['status'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Listing ID, type, and status are required.']);
    exit();
}

$listingId = (int)$input['listingId'];
$listingType = $conn->real_escape_string($input['listingType']);
$status = $conn->real_escape_string($input['status']);

// Validate listing type
if ($listingType !== 'pet' && $listingType !== 'supply') {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid listing type. Must be "pet" or "supply".']);
    exit();
}

// Validate status
$validStatuses = ['active', 'sold', 'pending', 'removed'];
if (!in_array($status, $validStatuses)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
    exit();
}

try {
    // Determine which table to update
    $tableName = ($listingType === 'pet') ? 'pets' : 'pet_supplies';
    
    // Update listing status
    $updateStmt = $conn->prepare("UPDATE $tableName SET status = ? WHERE id = ?");
    $updateStmt->bind_param("si", $status, $listingId);
    
    if ($updateStmt->execute()) {
        if ($updateStmt->affected_rows > 0) {
            // If marking as sold, create a transaction record
            if ($status === 'sold') {
                // For now, just record the transaction without a buyer (admin marked as sold)
                $ownerId = 0;
                $buyerId = null;
                $now = date('Y-m-d H:i:s');
                
                // First get the owner ID for the record
                $ownerSql = "SELECT owner_id FROM $tableName WHERE id = ?";
                $ownerStmt = $conn->prepare($ownerSql);
                $ownerStmt->bind_param("i", $listingId);
                $ownerStmt->execute();
                $ownerResult = $ownerStmt->get_result();
                
                if ($row = $ownerResult->fetch_assoc()) {
                    $ownerId = $row['owner_id'];
                }
                $ownerStmt->close();
                
                // Now create the transaction
                $transactionSql = "INSERT INTO transactions (item_id, item_type, seller_id, buyer_id, created_at) VALUES (?, ?, ?, ?, ?)";
                $transactionStmt = $conn->prepare($transactionSql);
                $transactionStmt->bind_param("issis", $listingId, $listingType, $ownerId, $buyerId, $now);
                $transactionStmt->execute();
                $transactionStmt->close();
            }
            
            $response['success'] = true;
            $response['message'] = "Listing status updated to '$status' successfully.";
            http_response_code(200);
        } else {
            // Listing not found
            $response['message'] = 'Listing not found or status already set to the requested value.';
            http_response_code(404);
        }
    } else {
        // Error occurred
        $response['message'] = 'Error updating listing status: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in update_listing_status.php: ' . $conn->error);
    }
    
    $updateStmt->close();

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in update_listing_status.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>