<?php

require 'Database.php'; // This already includes CORS headers from Database.php

// Initialize response structure
$response = ['success' => false, 'listing' => null, 'uploader' => null, 'message' => ''];

// Get listing_type and id from query parameters
$listing_type_raw = isset($_GET['type']) ? $_GET['type'] : null;
$listing_id_raw = isset($_GET['id']) ? $_GET['id'] : null;

$listing_type = null;
$listing_id = null;

// Validate listing_type
if ($listing_type_raw === null || $listing_type_raw === '') {
    $response['message'] = 'Error: Listing type (type) parameter is missing in the URL.';
    http_response_code(400); // Bad Request
    echo json_encode($response);
    exit();
}
$listing_type = trim($listing_type_raw);
if ($listing_type !== 'pet' && $listing_type !== 'supply') {
    $response['message'] = 'Error: Invalid listing type specified. Must be "pet" or "supply". Received: ' . htmlspecialchars($listing_type);
    http_response_code(400); // Bad Request
    echo json_encode($response);
    exit();
}

// Validate listing_id
if ($listing_id_raw === null || $listing_id_raw === '') { 
    $response['message'] = 'Error: Listing ID (id) parameter is missing in the URL.';
    http_response_code(400); // Bad Request
    echo json_encode($response);
    exit();
}
if (!is_numeric($listing_id_raw) || (int)$listing_id_raw <= 0) {
    $response['message'] = 'Error: Listing ID must be a positive number. Received: ' . htmlspecialchars($listing_id_raw);
    http_response_code(400); // Bad Request
    echo json_encode($response);
    exit();
}
$listing_id = (int)$listing_id_raw;

// If we've reached here, parameters are initially valid. Proceed to database logic.
try {
    $sql = "";
    // Select user details to display. Avoid sending sensitive info like password hashes.
    $user_fields = "u.name AS uploader_name, u.email AS uploader_email"; 
    // Example: If you add a phone field to your 'users' table:
    // $user_fields = "u.name AS uploader_name, u.email AS uploader_email, u.phone AS uploader_phone";

    if ($listing_type === 'pet') {
        // Fetch pet details and join with users table for owner info
        $sql = "SELECT p.id, p.owner_id, p.name, p.type, p.breed, p.age, p.price, p.location, p.description, p.image_url, p.created_at, 
                       {$user_fields},
                       'pet' AS calculated_listing_type
                FROM pets p
                JOIN users u ON p.owner_id = u.id
                WHERE p.id = ?";
    } elseif ($listing_type === 'supply') {
        // Fetch supply details and join with users table for owner info
        $sql = "SELECT ps.id, ps.owner_id, ps.name, ps.condition, ps.price, ps.location, ps.description, ps.image_url, ps.created_at,
                       {$user_fields},
                       'supply' AS calculated_listing_type
                FROM pet_supplies ps
                JOIN users u ON ps.owner_id = u.id
                WHERE ps.id = ?";
    }

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        $response['message'] = 'Database prepare statement failed: ' . htmlspecialchars($conn->error);
        http_response_code(500); // Internal Server Error
        error_log('SQL Prepare Error in get_listing_detail.php: ' . $conn->error);
        echo json_encode($response);
        exit();
    }

    $stmt->bind_param("i", $listing_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $data = $result->fetch_assoc();
        
        // Populate the listing part of the response
        $response['listing'] = [
            'id' => (int)$data['id'],
            'owner_id' => (int)$data['owner_id'], 
            'name' => $data['name'],
            'price' => (float)$data['price'],
            'location' => $data['location'],
            'description' => $data['description'],
            'image_url' => $data['image_url'],
            'created_at' => $data['created_at'],
            'listing_type' => $data['calculated_listing_type'] 
        ];

        // Add type-specific fields
        if ($listing_type === 'pet') {
            $response['listing']['type'] = $data['type']; 
            $response['listing']['breed'] = $data['breed'];
            $response['listing']['age'] = (isset($data['age']) && $data['age'] !== null) ? (int)$data['age'] : null;
        } elseif ($listing_type === 'supply') {
            $response['listing']['condition'] = $data['condition'];
        }

        // Populate the uploader part of the response
        $response['uploader'] = [
            'name' => $data['uploader_name'],
            'email' => $data['uploader_email']
            // 'phone' => $data['uploader_phone'] // Uncomment if you added phone to $user_fields and users table
        ];
        
        $response['success'] = true;
        $response['message'] = 'Listing details fetched successfully.';
        http_response_code(200); 
    } else {
        // Use htmlspecialchars for data coming from variables to prevent XSS if this message is displayed directly in HTML (though it's JSON)
        $response['message'] = 'Listing not found with the specified ID (' . htmlspecialchars($listing_id) . ') and type (' . htmlspecialchars($listing_type) . ').';
        http_response_code(404); // Not Found
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred during database operation: ' . htmlspecialchars($e->getMessage());
    http_response_code(500); 
    error_log('Exception in get_listing_detail.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>