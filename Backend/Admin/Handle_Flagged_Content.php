<?php
require '../Database.php'; // Ensure this path is correct for a file in Admin/

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$response = ['success' => false, 'message' => ''];

// Basic validation for core fields still needed
if (empty($input['action'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Action is required.']);
    exit();
}

$action = $conn->real_escape_string($input['action']);

// MODIFICATION: Add 'submit_report' to valid actions
$validActions = ['dismiss', 'remove', 'submit_report'];
if (!in_array($action, $validActions)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid action. Must be "dismiss", "remove", or "submit_report".']);
    exit();
}

// Specific validation for 'submit_report'
if ($action === 'submit_report') {
    if (empty($input['itemId']) || empty($input['itemType']) || empty($input['reporterId']) || !isset($input['reason'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'For submitting a report, itemId, itemType, reporterId, and reason are required.']);
        exit();
    }
} elseif ($action === 'dismiss' || $action === 'remove') {
    if (empty($input['itemId']) || empty($input['itemType'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'For dismiss/remove, itemId and itemType are required.']);
        exit();
    }
}

$itemId = isset($input['itemId']) ? (int)$input['itemId'] : 0;
$itemType = isset($input['itemType']) ? $conn->real_escape_string($input['itemType']) : '';

// Validate item type (if itemId and itemType are provided, which they are for all current actions)
if ($action !== 'submit_report' || ($action === 'submit_report' && !empty($itemType)) ) { // Only validate if itemType is expected and provided
    $validItemTypes = ['user', 'pet', 'supply'];
    if (!in_array($itemType, $validItemTypes)) {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'Invalid item type.']);
        exit();
    }
}


try {
    $conn->begin_transaction();

    if ($action === 'submit_report') {
        $reporterId = (int)$input['reporterId'];
        $reason = $conn->real_escape_string($input['reason']);
        $reportStatus = 'pending'; // New reports are pending
        $createdAt = date('Y-m-d H:i:s');

        // Assumes your reported_content table has these columns
        // (item_id, item_type, reporter_id, reason, status, created_at)
        // get_flagged_content.php queries for these columns.
        $insertStmt = $conn->prepare("INSERT INTO reported_content (item_id, item_type, reporter_id, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?)");
        $insertStmt->bind_param("isssss", $itemId, $itemType, $reporterId, $reason, $reportStatus, $createdAt);

        if ($insertStmt->execute()) {
            $conn->commit();
            $response['success'] = true;
            $response['message'] = 'Report submitted successfully.';
            http_response_code(201); // 201 Created
        } else {
            $conn->rollback();
            $response['message'] = 'Failed to submit report: ' . $conn->error;
            http_response_code(500);
            error_log('SQL Error in handle_flagged_content.php (submit_report): ' . $conn->error);
        }
        $insertStmt->close();

    } elseif ($action === 'remove' || $action === 'dismiss') {
        // Original logic for remove/dismiss
        if ($action === 'remove') {
            $itemTable = '';
            if ($itemType === 'user') $itemTable = 'users';
            elseif ($itemType === 'pet') $itemTable = 'pets';
            elseif ($itemType === 'supply') $itemTable = 'pet_supplies';

            if (!empty($itemTable)) {
                $deleteStmt = $conn->prepare("DELETE FROM $itemTable WHERE id = ?");
                $deleteStmt->bind_param("i", $itemId);
                $deleteStmt->execute();
                $deleteStmt->close();
            }
        }

        // Update the reported_content status to 'resolved'
        // Only update if a corresponding pending report exists
        $updateStmt = $conn->prepare("UPDATE reported_content SET status = 'resolved' WHERE item_id = ? AND item_type = ? AND status = 'pending'");
        $updateStmt->bind_param("is", $itemId, $itemType);

        if ($updateStmt->execute()) {
            // It's possible no rows were affected if the report wasn't 'pending' or didn't exist,
            // but the primary action (like delete) might have succeeded.
            // The success message should reflect the action taken.
            $conn->commit();
            $response['success'] = true;
            $response['message'] = $action === 'dismiss'
                ? 'Flag dismissed successfully.'
                : 'Content removed and flag resolved successfully.';
            http_response_code(200);
        } else {
            $conn->rollback();
            $response['message'] = 'Error updating flag status: ' . $conn->error;
            http_response_code(500);
            error_log('SQL Error in handle_flagged_content.php (update flag): ' . $conn->error);
        }
        $updateStmt->close();
    }

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in handle_flagged_content.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>