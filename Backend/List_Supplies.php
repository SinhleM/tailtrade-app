<?php
// --- Robust Error Handling & JSON Output ---
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

set_exception_handler(function($exception) {
    error_log("Unhandled Exception: " . $exception->getMessage() . " in " . $exception->getFile() . " on line " . $exception->getLine());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server Error: Unhandled exception. Please check server logs.',
        // 'debug_message' => $exception->getMessage() // For development
    ]);
    exit();
});

set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    error_log("PHP Error: [$severity] $message in $file on line $line");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => "Server Error: PHP error occurred. Please check server logs.",
        // 'debug_message' => "[$severity] $message" // For development
    ]);
    exit();
});

require 'Database.php';

$response = ['success' => false, 'message' => 'An unhandled error occurred processing the supply listing.'];

try {
    // --- Define Upload Directory ---
    $uploadDir = __DIR__ . '/uploads/listing_images/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0775, true)) {
            throw new Exception('Failed to create upload directory. Check permissions.');
        }
    }

    // --- Get POST data ---
    $owner_id = isset($_POST['owner_id']) ? filter_var($_POST['owner_id'], FILTER_VALIDATE_INT) : null;
    $name = isset($_POST['name']) ? trim($_POST['name']) : null; // Mapped from itemName
    $condition = isset($_POST['condition']) ? trim($_POST['condition']) : 'new';
    $price_raw = isset($_POST['price']) ? trim($_POST['price']) : null; // Mapped from itemPrice
    $location = isset($_POST['location']) ? trim($_POST['location']) : null; // Mapped from itemLocation
    $description = isset($_POST['description']) ? trim($_POST['description']) : null; // Mapped from itemDescription
    $createdAt = date('Y-m-d H:i:s');

    // --- Basic Validation for POST fields ---
    if (empty($owner_id) || empty($name) || empty($condition) || $price_raw === null || empty($location) || empty($description)) {
        http_response_code(400);
        $response['message'] = 'Missing required fields for supply.';
        echo json_encode($response);
        exit();
    }

    if (!is_numeric($price_raw) || (float)$price_raw < 0) {
        http_response_code(400);
        $response['message'] = 'Invalid price for supply.';
        echo json_encode($response);
        exit();
    }
    $price = (float)$price_raw;

    $valid_conditions = ['new', 'like-new', 'good', 'fair', 'used'];
    if (!in_array($condition, $valid_conditions)) {
        http_response_code(400);
        $response['message'] = 'Invalid condition value.';
        echo json_encode($response);
        exit();
    }

    // --- Check if owner_id exists in users table ---
    $stmtCheck = $conn->prepare("SELECT id FROM users WHERE id = ?");
    if ($stmtCheck === false) {
        throw new Exception('Database prepare error (check owner): ' . $conn->error);
    }
    $stmtCheck->bind_param("i", $owner_id);
    $stmtCheck->execute();
    $stmtCheck->store_result();
    if ($stmtCheck->num_rows === 0) {
        http_response_code(400);
        $response['message'] = 'Invalid owner ID.';
        echo json_encode($response);
        $stmtCheck->close();
        $conn->close();
        exit();
    }
    $stmtCheck->close();


    // --- Insert Supply into 'pet_supplies' table ---
    $stmtInsertSupply = $conn->prepare("INSERT INTO pet_supplies (owner_id, name, `condition`, price, location, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if ($stmtInsertSupply === false) {
        throw new Exception('Database prepare error (insert supply): ' . $conn->error);
    }
    $name_escaped = $conn->real_escape_string($name);
    $condition_escaped = $conn->real_escape_string($condition);
    $location_escaped = $conn->real_escape_string($location);
    $description_escaped = $conn->real_escape_string($description);

    $stmtInsertSupply->bind_param("issdsss", $owner_id, $name_escaped, $condition_escaped, $price, $location_escaped, $description_escaped, $createdAt);

    if ($stmtInsertSupply->execute()) {
        $listing_id = $conn->insert_id;
        $stmtInsertSupply->close();

        // --- Process Uploaded Images ---
        $itemType = 'supply';

        if (isset($_FILES['images']) && is_array($_FILES['images']['name']) && !empty($_FILES['images']['name'][0])) {
            $fileCount = count($_FILES['images']['name']);
            if ($fileCount > 5) $fileCount = 5;

            $stmtImg = $conn->prepare("INSERT INTO listing_images (listing_id, item_type, image_path, sort_order) VALUES (?, ?, ?, ?)");
            if ($stmtImg === false) {
                error_log('Database prepare error (insert image for supply listing ' . $listing_id . '): ' . $conn->error);
            }

            for ($i = 0; $i < $fileCount; $i++) {
                if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['images']['tmp_name'][$i];
                    $originalName = basename($_FILES['images']['name'][$i]);
                    $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
                    
                    $safeFileName = uniqid('supply_', true) . '.' . $fileExtension;
                    $destination = $uploadDir . $safeFileName;
                    $relativePath = 'uploads/listing_images/' . $safeFileName;

                    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                    if (!in_array($fileExtension, $allowedExtensions)) {
                        error_log("Invalid file type for supply image: $originalName (listing ID: $listing_id)");
                        continue;
                    }
                    if ($_FILES['images']['size'][$i] > 5 * 1024 * 1024) { // Max 5MB
                        error_log("Supply image too large: $originalName (listing ID: $listing_id)");
                        continue;
                    }

                    if (move_uploaded_file($tmpName, $destination)) {
                        if ($stmtImg) {
                            $sortOrder = $i;
                            $stmtImg->bind_param("issi", $listing_id, $itemType, $relativePath, $sortOrder);
                            if (!$stmtImg->execute()) {
                                error_log("Failed to insert supply image path to DB: $relativePath (listing ID: $listing_id) - " . $stmtImg->error);
                            }
                        }
                    } else {
                        error_log("Failed to move uploaded supply image: $originalName to $destination (listing ID: $listing_id)");
                    }
                } else {
                    error_log("Upload error for supply image #$i (listing ID: $listing_id): " . $_FILES['images']['error'][$i]);
                }
            }
            if ($stmtImg) $stmtImg->close();
        }
        $response['success'] = true;
        $response['message'] = 'Supply listed successfully!';
        http_response_code(201);

    } else {
        throw new Exception('Failed to list supply. Database execute error: ' . $stmtInsertSupply->error);
    }

} catch (Exception $e) {
    error_log('Caught Exception in List_Supplies.php: ' . $e->getMessage());
    http_response_code(isset($e->code) && is_int($e->code) ? $e->code : 500);
    $response['success'] = false;
    $response['message'] = $e->getMessage();
} finally {
    if (isset($conn) && $conn instanceof mysqli && $conn->thread_id) {
        $conn->close();
    }
    if (!headers_sent()) {
        echo json_encode($response);
    }
}
?>