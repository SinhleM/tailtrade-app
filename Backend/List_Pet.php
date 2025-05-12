<?php
require 'Database.php'; // Includes CORS headers and DB connection

$response = ['success' => false, 'message' => 'An error occurred.'];

// --- Define Upload Directory ---
$uploadDir = __DIR__ . '/uploads/listing_images/'; // Assumes uploads is in the same dir as this script
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0775, true)) { // Increased permissions for mkdir
        $response['message'] = 'Failed to create upload directory.';
        http_response_code(500);
        echo json_encode($response);
        exit();
    }
}


// --- Get POST data ---
$owner_id = isset($_POST['owner_id']) ? (int)$_POST['owner_id'] : null;
$name = isset($_POST['name']) ? trim($_POST['name']) : null;
$type = isset($_POST['type']) ? trim($_POST['type']) : 'dog'; // Default from form
$breed = isset($_POST['breed']) ? trim($_POST['breed']) : null;
$age = isset($_POST['age']) ? trim($_POST['age']) : null; // Validate as number later
$price = isset($_POST['price']) ? trim($_POST['price']) : null; // Validate as number later
$location = isset($_POST['location']) ? trim($_POST['location']) : null;
$description = isset($_POST['description']) ? trim($_POST['description']) : null;
$createdAt = date('Y-m-d H:i:s');

// --- Basic Validation for POST fields ---
if (empty($owner_id) || empty($name) || empty($type) || empty($breed) || $age === null || $price === null || empty($location) || empty($description)) {
    $response['message'] = 'Missing required fields.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}
if (!is_numeric($age) || (int)$age < 0) {
    $response['message'] = 'Invalid age.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}
$age = (int)$age;

if (!is_numeric($price) || (float)$price < 0) {
    $response['message'] = 'Invalid price.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}
$price = (float)$price;


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


// --- Insert Pet into 'pets' table ---
// Note: `image_url` column is removed from this insert.
$stmtInsertPet = $conn->prepare("INSERT INTO pets (owner_id, name, type, breed, age, price, location, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
if ($stmtInsertPet === false) {
     http_response_code(500);
     $response['message'] = 'Database prepare error (insert pet): ' . $conn->error;
     echo json_encode($response);
     exit();
}
// Escaping strings for SQL (though prepared statements handle this, good for consistency if used elsewhere)
$name_escaped = $conn->real_escape_string($name);
$type_escaped = $conn->real_escape_string($type);
$breed_escaped = $conn->real_escape_string($breed);
$location_escaped = $conn->real_escape_string($location);
$description_escaped = $conn->real_escape_string($description);

$stmtInsertPet->bind_param("isssidsis", $owner_id, $name_escaped, $type_escaped, $breed_escaped, $age, $price, $location_escaped, $description_escaped, $createdAt);

if ($stmtInsertPet->execute()) {
    $listing_id = $conn->insert_id; // Get the ID of the newly inserted pet
    $stmtInsertPet->close();

    // --- Process Uploaded Images ---
    $imagePaths = [];
    $itemType = 'pet'; // For listing_images table

    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) { // Check if any file is uploaded
        $fileCount = count($_FILES['images']['name']);
        if ($fileCount > 5) {
            // Optional: handle error if more than 5 files sent by malicious attempt
            $fileCount = 5; // Process only up to 5
        }

        $stmtImg = $conn->prepare("INSERT INTO listing_images (listing_id, item_type, image_path, sort_order) VALUES (?, ?, ?, ?)");
        if ($stmtImg === false) {
            // Log error, but try to continue or decide error strategy
            error_log('Database prepare error (insert image): ' . $conn->error);
            // If image insertion fails, you might want to delete the pet record or mark it as incomplete.
        }

        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $tmpName = $_FILES['images']['tmp_name'][$i];
                $originalName = basename($_FILES['images']['name'][$i]);
                $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
                
                // Create a unique name to prevent overwrites and for security
                $safeFileName = uniqid('pet_', true) . '.' . $fileExtension; 
                $destination = $uploadDir . $safeFileName;
                $relativePath = 'uploads/listing_images/' . $safeFileName; // Path to store in DB

                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                if (!in_array($fileExtension, $allowedExtensions)) {
                    error_log("Invalid file type for file: $originalName");
                    continue; 
                }
                if ($_FILES['images']['size'][$i] > 5 * 1024 * 1024) { // Max 5MB
                    error_log("File too large: $originalName");
                    continue;
                }

                if (move_uploaded_file($tmpName, $destination)) {
                    if ($stmtImg) { // If prepare was successful
                        $sortOrder = $i;
                        $stmtImg->bind_param("issi", $listing_id, $itemType, $relativePath, $sortOrder);
                        if (!$stmtImg->execute()) {
                            error_log("Failed to insert image path to DB for: $relativePath - " . $stmtImg->error);
                        }
                    }
                } else {
                    error_log("Failed to move uploaded file: $originalName to $destination");
                }
            } else {
                 error_log("Upload error for file #$i: " . $_FILES['images']['error'][$i]);
            }
        }
        if ($stmtImg) $stmtImg->close();

        $response['success'] = true;
        $response['message'] = 'Pet listed successfully!';
        http_response_code(201);
    } else {
        // No images uploaded, but pet was inserted. This might be acceptable.
        // If images are mandatory, this block should return an error & potentially rollback pet insert.
        // For now, assume pet is listed, and if no images, it's fine based on current logic flow.
        // To make images mandatory, check selectedFiles.length in frontend AND here:
        // if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
        //    // Delete the pet just inserted
        //    $conn->query("DELETE FROM pets WHERE id = $listing_id");
        //    $response['message'] = 'At least one image is required.';
        //    http_response_code(400);
        //    echo json_encode($response);
        //    $conn->close();
        //    exit();
        // }
        $response['success'] = true;
        $response['message'] = 'Pet listed successfully (no images or error processing images).';
        http_response_code(201); // Or 200 if "success with issues"
    }

} else {
    http_response_code(500);
    error_log('Pet listing failed: ' . $stmtInsertPet->error);
    $response['message'] = 'Failed to list pet. ' . $stmtInsertPet->error;
}

if (isset($stmtInsertPet) && $stmtInsertPet) $stmtInsertPet->close();
$conn->close();
echo json_encode($response);
?>