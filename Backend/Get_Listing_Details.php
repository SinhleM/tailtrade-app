<?php
require 'Database.php';

$response = ['success' => false, 'listing' => null, 'uploader' => null, 'message' => ''];
// $imageBaseUrl = 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend/'; // Adjust as per your setup

$listing_type_raw = isset($_GET['type']) ? $_GET['type'] : null;
$listing_id_raw = isset($_GET['id']) ? $_GET['id'] : null;

// Parameter Validation (trimmed for brevity, assume it's same as your original)
if (empty($listing_type_raw) || !in_array($listing_type_raw, ['pet', 'supply'])) {
    $response['message'] = 'Invalid or missing listing type.'; http_response_code(400); echo json_encode($response); exit();
}
if (empty($listing_id_raw) || !is_numeric($listing_id_raw) || (int)$listing_id_raw <= 0) {
    $response['message'] = 'Invalid or missing listing ID.'; http_response_code(400); echo json_encode($response); exit();
}
$listing_type = $listing_type_raw;
$listing_id = (int)$listing_id_raw;

try {
    $sql = "";
    $user_fields = "u.name AS uploader_name, u.email AS uploader_email";

    if ($listing_type === 'pet') {
        // Removed p.image_url from main query
        $sql = "SELECT p.id, p.owner_id, p.name, p.type, p.breed, p.age, p.price, p.location, p.description, p.created_at, 
                       {$user_fields}, 'pet' AS calculated_listing_type
                FROM pets p
                JOIN users u ON p.owner_id = u.id
                WHERE p.id = ?";
    } elseif ($listing_type === 'supply') {
        // Removed ps.image_url from main query
        $sql = "SELECT ps.id, ps.owner_id, ps.name, ps.condition, ps.price, ps.location, ps.description, ps.created_at,
                       {$user_fields}, 'supply' AS calculated_listing_type
                FROM pet_supplies ps
                JOIN users u ON ps.owner_id = u.id
                WHERE ps.id = ?";
    }

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        $response['message'] = 'Database prepare statement failed: ' . htmlspecialchars($conn->error);
        http_response_code(500); error_log('SQL Prepare Error: ' . $conn->error); echo json_encode($response); exit();
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
            // 'image_url' is removed here, will be replaced by 'images' array below
            'created_at' => $data['created_at'],
            'listing_type' => $data['calculated_listing_type'] 
        ];

        if ($listing_type === 'pet') {
            $response['listing']['type'] = $data['type']; 
            $response['listing']['breed'] = $data['breed'];
            $response['listing']['age'] = (isset($data['age']) && $data['age'] !== null) ? (int)$data['age'] : null;
        } elseif ($listing_type === 'supply') {
            $response['listing']['condition'] = $data['condition'];
        }

        // Fetch all images for this listing
        $images = [];
        $stmtImg = $conn->prepare("SELECT image_path FROM listing_images WHERE listing_id = ? AND item_type = ? ORDER BY sort_order ASC, id ASC");
        if($stmtImg) {
            $stmtImg->bind_param("is", $listing_id, $listing_type);
            $stmtImg->execute();
            $resultImg = $stmtImg->get_result();
            while ($imgRow = $resultImg->fetch_assoc()) {
                // Optionally prepend base URL
                // $images[] = ($imgRow['image_path'] && strpos($imgRow['image_path'], 'http') !== 0) ? $imageBaseUrl . $imgRow['image_path'] : $imgRow['image_path'];
                 $images[] = $imgRow['image_path'];
            }
            $stmtImg->close();
        }
        $response['listing']['images'] = $images; // Add images array


        $response['uploader'] = ['name' => $data['uploader_name'], 'email' => $data['uploader_email']];
        
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
    error_log('Exception in get_listing_detail.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>