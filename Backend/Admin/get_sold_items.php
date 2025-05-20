<?php
require 'Database.php'; // This includes CORS headers and DB connection

// Response structure
$response = ['success' => false, 'sold' => [], 'message' => ''];

try {
    // SQL to fetch sold listings (pets and supplies)
    // This assumes there's a status column in both pets and pet_supplies tables
    // or a separate transactions table tracking sold items
    $sql = "
        -- Sold Pets
        SELECT 
            p.id,
            p.name,
            p.owner_id AS seller_id,
            (SELECT name FROM users WHERE id = p.owner_id) AS seller_name,
            t.buyer_id,
            (SELECT name FROM users WHERE id = t.buyer_id) AS buyer_name,
            p.price,
            'pet' AS listing_type,
            p.breed,
            p.type,
            t.created_at AS sold_at
        FROM 
            pets p
        JOIN 
            transactions t ON p.id = t.item_id AND t.item_type = 'pet'
        WHERE 
            p.status = 'sold'
            
        UNION ALL
        
        -- Sold Supplies
        SELECT 
            ps.id,
            ps.name,
            ps.owner_id AS seller_id,
            (SELECT name FROM users WHERE id = ps.owner_id) AS seller_name,
            t.buyer_id,
            (SELECT name FROM users WHERE id = t.buyer_id) AS buyer_name,
            ps.price,
            'supply' AS listing_type,
            NULL AS breed,
            NULL AS type,
            t.created_at AS sold_at
        FROM 
            pet_supplies ps
        JOIN 
            transactions t ON ps.id = t.item_id AND t.item_type = 'supply'
        WHERE 
            ps.status = 'sold'
            
        ORDER BY 
            sold_at DESC
    ";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Convert numeric fields to appropriate types
                $row['id'] = (int)$row['id'];
                $row['seller_id'] = (int)$row['seller_id'];
                if ($row['buyer_id'] !== null) {
                    $row['buyer_id'] = (int)$row['buyer_id'];
                }
                $row['price'] = (float)$row['price'];
                
                // Add to sold items array
                $response['sold'][] = $row;
            }

            $response['success'] = true;
            $response['message'] = 'Sold items fetched successfully.';
            http_response_code(200);
        } else {
            $response['success'] = true;
            $response['message'] = 'No sold items found.';
            http_response_code(200);
        }
    } else {
        $response['message'] = 'Error executing query: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in get_sold_items.php: ' . $conn->error);
    }

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in get_sold_items.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>