<?php
require 'Database.php'; // Includes CORS headers and DB connection

$response = ['success' => false, 'message' => 'An error occurred.'];

// --- Define Upload Directory ---
$uploadDir = __DIR__ . '/uploads/listing_images/'; 
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0775, true)) {
        $response['message'] = 'Failed to create upload directory.';
        http_response_code(500);
        echo json_encode($response);
        exit();
    }
}

// --- Get POST data ---
$owner_id = isset($_POST['owner_id']) ? (int)$_POST['owner_id'] : null;
$name = isset($_POST['name']) ? trim($_POST['name']) : null; // Mapped from itemName in frontend
$condition = isset($_POST['condition']) ? trim($_POST['condition']) : 'new'; // Default from form
$price = isset($_POST['price']) ? trim($_POST['price']) : null; // Mapped from itemPrice
$location = isset($_POST['location']) ? trim($_POST['location']) : null; // Mapped from itemLocation
$description = isset($_POST['description']) ? trim($_POST['description']) : null; // Mapped from itemDescription
$createdAt = date('Y-m-d H:i:s');

// --- Basic Validation for POST fields ---
if (empty($owner_id) || empty($name) || empty($condition) || $price === null || empty($location) || empty($description)) {
    $response['message'] = 'Missing required fields for supply.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

if (!is_numeric($price) || (float)$price < 0) {
    $response['message'] = 'Invalid price for supply.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}
$price = (float)$price;

// Validate condition against ENUM values (optional, DB will also do this)
$valid_conditions = ['new', 'like-new', 'good', 'fair', 'used'];
if (!in_array($condition, $valid_conditions)) {
    $response['message'] = 'Invalid condition value.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// --- Check if owner_id exists in users table ---
$stmtCheck = $conn->prepare("SELECT id FROM users WHERE id = ?");
if ($stmtCheck === false) {
     http_response_code(500);
     $response['message'] = 'Database prepare error (check owner): ' . $conn->error;
     echo json_encode($response);
     exit();
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
// Note: `image_url` column is removed
$stmtInsertSupply = $conn->prepare("INSERT INTO pet_supplies (owner_id, name, `condition`, price, location, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
if ($stmtInsertSupply === false) {
     http_response_code(500);
     $response['message'] = 'Database prepare error (insert supply): ' . $conn->error;
     echo json_encode($response);
     exit();
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
    $imagePaths = [];
    $itemType = 'supply';

    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        $fileCount = count($_FILES['images']['name']);
         if ($fileCount > 5) $fileCount = 5;

        $stmtImg = $conn->prepare("INSERT INTO listing_images (listing_id, item_type, image_path, sort_order) VALUES (?, ?, ?, ?)");
         if ($stmtImg === false) {
            error_log('Database prepare error (insert image for supply): ' . $conn->error);
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
                    error_log("Invalid file type for supply image: $originalName");
                    continue;
                }
                if ($_FILES['images']['size'][$i] > 5 * 1024 * 1024) { // Max 5MB
                     error_log("Supply image too large: $originalName");
                    continue;
                }

                if (move_uploaded_file($tmpName, $destination)) {
                    if ($stmtImg) {
                        $sortOrder = $i;
                        $stmtImg->bind_param("issi", $listing_id, $itemType, $relativePath, $sortOrder);
                         if (!$stmtImg->execute()) {
                            error_log("Failed to insert supply image path to DB: $relativePath - " . $stmtImg->error);
                        }
                    }
                } else {
                     error_log("Failed to move uploaded supply image: $originalName to $destination");
                }
            } else {
                error_log("Upload error for supply image #$i: " . $_FILES['images']['error'][$i]);
            }
        }
        if ($stmtImg) $stmtImg->close();
        $response['success'] = true;
        $response['message'] = 'Supply listed successfully!';
        http_response_code(201);
    } else {
        // As with pets, decide policy if no images are uploaded.
        // If frontend validates for at least one image, this block might only be hit on direct API calls.
        $response['success'] = true;
        $response['message'] = 'Supply listed successfully (no images or error processing images).';
        http_response_code(201);
    }

} else {
    http_response_code(500);
    error_log('Supply listing failed: ' . $stmtInsertSupply->error);
    $response['message'] = 'Failed to list supply. ' . $stmtInsertSupply->error;
}

if (isset($stmtInsertSupply) && $stmtInsertSupply) $stmtInsertSupply->close();
$conn->close();
echo json_encode($response);
?>