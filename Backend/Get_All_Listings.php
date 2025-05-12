<?php
require 'Database.php'; // This already includes CORS headers

$response = ['success' => false, 'listings' => [], 'message' => ''];
// Define your base URL for images if paths are relative
// $imageBaseUrl = 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend/'; // Adjust as per your setup

try {
    // The image_url alias now fetches from listing_images
    // It takes the image with the lowest sort_order, then lowest id as the primary.
    $sql = "
        SELECT
            p.id,
            p.owner_id,
            p.name,
            p.type,
            p.breed,
            p.age,
            p.price,
            p.location,
            p.description,
            p.created_at,
            'pet' AS listing_type,
            NULL AS `condition`,
            (SELECT li.image_path FROM listing_images li WHERE li.listing_id = p.id AND li.item_type = 'pet' ORDER BY li.sort_order ASC, li.id ASC LIMIT 1) AS image_url
        FROM
            pets p
        UNION ALL
        SELECT
            ps.id,
            ps.owner_id,
            ps.name,
            NULL AS type,
            NULL AS breed,
            NULL AS age,
            ps.price,
            ps.location,
            ps.description,
            ps.created_at,
            'supply' AS listing_type,
            ps.condition,
            (SELECT li.image_path FROM listing_images li WHERE li.listing_id = ps.id AND li.item_type = 'supply' ORDER BY li.sort_order ASC, li.id ASC LIMIT 1) AS image_url
        FROM
            pet_supplies ps
        ORDER BY
            created_at DESC;
    ";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $row['id'] = (int)$row['id'];
                $row['owner_id'] = (int)$row['owner_id'];
                if ($row['age'] !== null) {
                    $row['age'] = (int)$row['age'];
                }
                $row['price'] = (float)$row['price'];
                
                // Optionally prepend base URL to image_url if it's a relative path
                // if ($row['image_url'] && strpos($row['image_url'], 'http') !== 0) {
                //    $row['image_url'] = $imageBaseUrl . $row['image_url'];
                // }

                $response['listings'][] = $row;
            }
            $response['success'] = true;
            $response['message'] = 'Listings fetched successfully.';
            http_response_code(200);
        } else {
            $response['success'] = true; 
            $response['message'] = 'No listings found.';
            http_response_code(200);
        }
    } else {
        $response['message'] = 'Error executing query: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in get_all_listings.php: ' . $conn->error);
    }

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in get_all_listings.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>