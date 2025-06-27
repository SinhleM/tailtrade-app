<?php
require 'Database.php';

$response = ['success' => false, 'listing' => null, 'uploader' => null, 'message' => ''];

// --- CORRECTED STATIC BASE URL FOR IMAGES ---
// On AwardSpace, your domain points directly to the directory containing 'uploads'.
// So, the base URL for images is simply your domain + /uploads/listing_images/
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://");
$domain = $_SERVER['HTTP_HOST'];
// The correct web-accessible path on AwardSpace is just /uploads/listing_images/
$imageBaseUrl = $protocol . $domain . '/uploads/listing_images/'; 

$listing_type_raw = isset($_GET['type']) ? $_GET['type'] : null;
$listing_id_raw = isset($_GET['id']) ? $_GET['id'] : null;

if (empty($listing_type_raw) || !in_array($listing_type_raw, ['pet', 'supply'])) {
    $response['message'] = 'Invalid or missing listing type.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}
if (empty($listing_id_raw) || !is_numeric($listing_id_raw) || (int)$listing_id_raw <= 0) {
    $response['message'] = 'Invalid or missing listing ID.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}
$listing_type = $listing_type_raw;
$listing_id = (int)$listing_id_raw;

try {
    $sql = "";
    $user_fields = "u.id AS uploader_id, u.name AS uploader_name, u.email AS uploader_email"; // Added u.id here

    if ($listing_type === 'pet') {
        $sql = "SELECT p.id, p.owner_id, p.name, p.type, p.breed, p.age, p.price, p.location, p.description, p.created_at, 
                         {$user_fields}, 'pet' AS calculated_listing_type, p.status 
                FROM pets p
                JOIN users u ON p.owner_id = u.id
                WHERE p.id = ?";
    } elseif ($listing_type === 'supply') {
        $sql = "SELECT ps.id, ps.owner_id, ps.name, ps.condition, ps.price, ps.location, ps.description, ps.created_at,
                         {$user_fields}, 'supply' AS calculated_listing_type, ps.status
                FROM pet_supplies ps
                JOIN users u ON ps.owner_id = u.id
                WHERE ps.id = ?";
    }

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        $response['message'] = 'Database prepare statement failed: ' . htmlspecialchars($conn->error);
        http_response_code(500);
        error_log('SQL Prepare Error in Get_Listing_Details.php: ' . $conn->error);
        echo json_encode($response);
        exit();
    }

    $stmt->bind_param("i", $listing_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $data = $result->fetch_assoc();
        
        $response['listing'] = [
            'id' => (int)$data['id'],
            'owner_id' => (int)$data['owner_id'], 
            'name' => $data['name'],
            'price' => (float)$data['price'],
            'location' => $data['location'],
            'description' => $data['description'],
            'created_at' => $data['created_at'],
            'listing_type' => $data['calculated_listing_type'],
            'status' => $data['status'] ?? 'available' // Default status if not set
        ];

        if ($listing_type === 'pet') {
            $response['listing']['type'] = $data['type']; 
            $response['listing']['breed'] = $data['breed'];
            $response['listing']['age'] = (isset($data['age']) && $data['age'] !== null) ? (int)$data['age'] : null;
        } elseif ($listing_type === 'supply') {
            $response['listing']['condition'] = $data['condition'];
        }

        $images = [];
        $stmtImg = $conn->prepare("SELECT image_path FROM listing_images WHERE listing_id = ? AND item_type = ? ORDER BY sort_order ASC, id ASC");
        if ($stmtImg) {
            $stmtImg->bind_param("is", $listing_id, $listing_type);
            $stmtImg->execute();
            $resultImg = $stmtImg->get_result();
            while ($imgRow = $resultImg->fetch_assoc()) {
                if (!empty($imgRow['image_path'])) {
                    $imagePath = $imgRow['image_path'];
                    
                    // Ensure the image path is just the filename or relative from uploads/listing_images/
                    // Example: if image_path from DB is 'uploads/listing_images/image.jpg'
                    // We need to remove any leading 'uploads/listing_images/' if it's stored that way,
                    // and then prepend the correct $imageBaseUrl.
                    
                    // This logic attempts to clean the path if it contains the full 'uploads/listing_images/' prefix
                    $cleanedImagePath = str_replace('uploads/listing_images/', '', $imagePath);
                    $images[] = $imageBaseUrl . $cleanedImagePath; // <--- CORRECTED IMAGE URL CONSTRUCTION
                }
            }
            $stmtImg->close();
        }
        $response['listing']['images'] = $images;

        $response['uploader'] = [
            'id' => (int)$data['uploader_id'], // Use the uploader_id from the query
            'name' => $data['uploader_name'], 
            'email' => $data['uploader_email']
        ];
        
        $response['success'] = true;
        $response['message'] = 'Listing details fetched successfully.';
        http_response_code(200); 
    } else {
        $response['message'] = 'Listing not found.';
        http_response_code(404);
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . htmlspecialchars($e->getMessage());
    http_response_code(500); 
    error_log('Exception in Get_Listing_Details.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>