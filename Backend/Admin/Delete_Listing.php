<?php
require '../Database.php'; // This includes CORS headers and DB connection

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$response = ['success' => false, 'message' => ''];

// Basic validation
if (empty($input['listingId']) || empty($input['listingType'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Listing ID and type are required.']);
    exit();
}

$listingId = (int)$input['listingId'];
$listingType = $conn->real_escape_string($input['listingType']);

// Validate listing type
if ($listingType !== 'pet' && $listingType !== 'supply') {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid listing type. Must be "pet" or "supply".']);
    exit();
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Determine which table to delete from
    $tableName = ($listingType === 'pet') ? 'pets' : 'pet_supplies';
    
    // Delete any images associated with the listing
    $deleteImagesStmt = $conn->prepare("DELETE FROM listing_images WHERE listing_id = ? AND item_type = ?");
    $deleteImagesStmt->bind_param("is", $listingId, $listingType);
    $deleteImagesStmt->execute();
    $deleteImagesStmt->close();
    
    // Delete any reports related to this listing
    $deleteReportsStmt = $conn->prepare("DELETE FROM reported_content WHERE item_id = ? AND item_type = ?");
    $deleteReportsStmt->bind_param("is", $listingId, $listingType);
    $deleteReportsStmt->execute();
    $deleteReportsStmt->close();
    
    // Delete any transactions related to this listing
    $deleteTransactionsStmt = $conn->prepare("DELETE FROM transactions WHERE item_id = ? AND item_type = ?");
    $deleteTransactionsStmt->bind_param("is", $listingId, $listingType);
    $deleteTransactionsStmt->execute();
    $deleteTransactionsStmt->close();
    
    // Delete the listing itself
    $deleteListingStmt = $conn->prepare("DELETE FROM $tableName WHERE id = ?");
    $deleteListingStmt->bind_param("i", $listingId);
    
    if ($deleteListingStmt->execute()) {
        if ($deleteListingStmt->affected_rows > 0) {
            // Commit the transaction
            $conn->commit();
            
            $response['success'] = true;
            $response['message'] = 'Listing deleted successfully.';
            http_response_code(200);
        } else {
            // Listing not found
            $conn->rollback();
            $response['message'] = 'Listing not found.';
            http_response_code(404);
        }
    } else {
        // Error occurred
        $conn->rollback();
        $response['message'] = 'Error deleting listing: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in delete_listing.php: ' . $conn->error);
    }
    
    $deleteListingStmt->close();

} catch (Exception $e) {
    // Roll back transaction on error
    $conn->rollback();
    
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in delete_listing.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>