<?php
// --- Robust Error Handling & JSON Output ---
ini_set('display_errors', 0); // Crucial: Prevents PHP from outputting HTML errors
error_reporting(E_ALL);       // Report all errors (to server logs)

// Set content type to JSON for all responses from this script
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff'); // Security: Prevents MIME-sniffing

// Global Exception Handler
// Catches any uncaught exceptions during script execution
set_exception_handler(function($exception) {
    // Log the detailed exception (important for server-side debugging)
    error_log("Unhandled Exception: " . $exception->getMessage() . " in " . $exception->getFile() . " on line " . $exception->getLine());

    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Server Error: Unhandled exception. Please check server logs.',
        // For development, you might include more details:
        // 'debug_message' => $exception->getMessage(),
        // 'debug_file' => $exception->getFile(),
        // 'debug_line' => $exception->getLine()
    ]);
    exit();
});

// Global Error Handler
// Catches PHP errors (warnings, notices, etc.) that are not exceptions
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        // This error code is not included in error_reporting
        return false; // Let the standard PHP error handler take over (which should be logging)
    }
    // Log the detailed error
    error_log("PHP Error: [$severity] $message in $file on line $line");

    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => "Server Error: PHP error occurred. Please check server logs.",
        // For development, you might include more details:
        // 'debug_message' => "[$severity] $message",
        // 'debug_file' => $file,
        // 'debug_line' => $line
    ]);
    exit(); // Important to stop script execution after sending JSON error
});

require 'Database.php'; // Includes DB connection. Ensure Database.php itself doesn't output errors.

$response = ['success' => false, 'message' => 'An unhandled error occurred processing the pet listing.']; // Default response

try {
    // --- Define Upload Directory ---
    $uploadDir = __DIR__ . '/uploads/listing_images/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0775, true)) {
            // This error will be caught by the generic catch block or, if it fails before, the global handlers.
            throw new Exception('Failed to create upload directory. Check permissions.');
        }
    }

    // --- Get POST data ---
    $owner_id = isset($_POST['owner_id']) ? filter_var($_POST['owner_id'], FILTER_VALIDATE_INT) : null;
    $name = isset($_POST['name']) ? trim($_POST['name']) : null;
    $type = isset($_POST['type']) ? trim($_POST['type']) : 'dog';
    $breed = isset($_POST['breed']) ? trim($_POST['breed']) : null;
    $age_raw = isset($_POST['age']) ? trim($_POST['age']) : null;
    $price_raw = isset($_POST['price']) ? trim($_POST['price']) : null;
    $location = isset($_POST['location']) ? trim($_POST['location']) : null;
    $description = isset($_POST['description']) ? trim($_POST['description']) : null;
    $createdAt = date('Y-m-d H:i:s');

    // --- Basic Validation for POST fields ---
    if (empty($owner_id) || empty($name) || empty($type) || empty($breed) || $age_raw === null || $price_raw === null || empty($location) || empty($description)) {
        http_response_code(400);
        $response['message'] = 'Missing required fields.';
        echo json_encode($response);
        exit();
    }

    if (!is_numeric($age_raw) || (int)$age_raw < 0) {
        http_response_code(400);
        $response['message'] = 'Invalid age.';
        echo json_encode($response);
        exit();
    }
    $age = (int)$age_raw;

    if (!is_numeric($price_raw) || (float)$price_raw < 0) {
        http_response_code(400);
        $response['message'] = 'Invalid price.';
        echo json_encode($response);
        exit();
    }
    $price = (float)$price_raw;


    // --- Check if owner_id exists in users table ---
    $stmtCheck = $conn->prepare("SELECT id FROM users WHERE id = ?");
    if ($stmtCheck === false) {
         // This error should ideally be logged more specifically if possible
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
        $conn->close(); // Ensure connection is closed on early exit
        exit();
    }
    $stmtCheck->close();


    // --- Insert Pet into 'pets' table ---
    $stmtInsertPet = $conn->prepare("INSERT INTO pets (owner_id, name, type, breed, age, price, location, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmtInsertPet === false) {
         throw new Exception('Database prepare error (insert pet): ' . $conn->error);
    }
    // Using real_escape_string is redundant with prepared statements but doesn't harm
    $name_escaped = $conn->real_escape_string($name);
    $type_escaped = $conn->real_escape_string($type);
    $breed_escaped = $conn->real_escape_string($breed);
    $location_escaped = $conn->real_escape_string($location);
    $description_escaped = $conn->real_escape_string($description);

    $stmtInsertPet->bind_param("isssidsis", $owner_id, $name_escaped, $type_escaped, $breed_escaped, $age, $price, $location_escaped, $description_escaped, $createdAt);

    if ($stmtInsertPet->execute()) {
        $listing_id = $conn->insert_id;
        $stmtInsertPet->close();

        // --- Process Uploaded Images ---
        $itemType = 'pet';

        if (isset($_FILES['images']) && is_array($_FILES['images']['name']) && !empty($_FILES['images']['name'][0])) {
            $fileCount = count($_FILES['images']['name']);
            if ($fileCount > 5) $fileCount = 5; // Process only up to 5

            $stmtImg = $conn->prepare("INSERT INTO listing_images (listing_id, item_type, image_path, sort_order) VALUES (?, ?, ?, ?)");
            if ($stmtImg === false) {
                error_log('Database prepare error (insert image for pet listing ' . $listing_id . '): ' . $conn->error);
                // Decide if this is a fatal error for the listing or just a warning
                // For now, the listing is created, but images might be missing.
            }

            for ($i = 0; $i < $fileCount; $i++) {
                if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['images']['tmp_name'][$i];
                    $originalName = basename($_FILES['images']['name'][$i]);
                    $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
                    
                    $safeFileName = uniqid('pet_', true) . '.' . $fileExtension;
                    $destination = $uploadDir . $safeFileName;
                    // IMPORTANT: Storing relative path for flexibility
                    $relativePath = 'uploads/listing_images/' . $safeFileName;

                    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                    if (!in_array($fileExtension, $allowedExtensions)) {
                        error_log("Invalid file type for pet image: $originalName (listing ID: $listing_id)");
                        continue;
                    }
                    if ($_FILES['images']['size'][$i] > 5 * 1024 * 1024) { // Max 5MB
                        error_log("Pet image too large: $originalName (listing ID: $listing_id)");
                        continue;
                    }

                    if (move_uploaded_file($tmpName, $destination)) {
                        if ($stmtImg) {
                            $sortOrder = $i;
                            // Use the relative path for DB storage
                            $stmtImg->bind_param("issi", $listing_id, $itemType, $relativePath, $sortOrder);
                            if (!$stmtImg->execute()) {
                                error_log("Failed to insert pet image path to DB: $relativePath (listing ID: $listing_id) - " . $stmtImg->error);
                            }
                        }
                    } else {
                        error_log("Failed to move uploaded pet image: $originalName to $destination (listing ID: $listing_id)");
                    }
                } else {
                     error_log("Upload error for pet image #$i (listing ID: $listing_id): " . $_FILES['images']['error'][$i]);
                }
            }
            if ($stmtImg) $stmtImg->close();
        }
        // Whether images were processed successfully or not, the pet record was created.
        $response['success'] = true;
        $response['message'] = 'Pet listed successfully!';
        http_response_code(201);

    } else {
        // Execution of insert failed
        throw new Exception('Failed to list pet. Database execute error: ' . $stmtInsertPet->error);
    }

} catch (Exception $e) {
    // Catch any specific exceptions thrown in the try block
    error_log('Caught Exception in List_Pet.php: ' . $e->getMessage()); // Log the exception
    http_response_code(isset($e->code) && is_int($e->code) ? $e->code : 500); // Use exception code if set and valid, else 500
    $response['success'] = false;
    $response['message'] = $e->getMessage(); // Send exception message to client
} finally {
    // This block executes regardless of whether an exception was thrown or not.
    // Close database connection if it's open and not done by individual exit points
    if (isset($conn) && $conn instanceof mysqli && $conn->thread_id) {
        $conn->close();
    }
    // Ensure final output is JSON, if not already sent by exit()
    // This check is to prevent "headers already sent" if echo json_encode was called before.
    if (!headers_sent()) {
         echo json_encode($response);
    }
}
// No exit() here, script ends and `finally` block with json_encode runs
// or one of the exit() calls within the script would have already terminated it.
?>