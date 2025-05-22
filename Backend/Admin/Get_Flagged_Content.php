<?php
require '../Database.php'; // This includes CORS headers and DB connection

// Response structure
$response = ['success' => false, 'flagged' => [], 'message' => ''];

try {
    // SQL to fetch flagged listings and users
    // This assumes you have a 'reported_content' table that stores reports
    $sql = "
        -- Flagged Users
        SELECT 
            u.id,
            u.name,
            'user' AS type,
            r.reporter_id,
            (SELECT name FROM users WHERE id = r.reporter_id) AS reporter_name,
            r.reason,
            r.created_at AS reported_at
        FROM 
            users u
        JOIN 
            reported_content r ON u.id = r.item_id AND r.item_type = 'user'
        WHERE 
            r.status = 'pending'
            
        UNION ALL
        
        -- Flagged Pet Listings
        SELECT 
            p.id,
            p.name,
            'pet' AS type,
            r.reporter_id,
            (SELECT name FROM users WHERE id = r.reporter_id) AS reporter_name,
            r.reason,
            r.created_at AS reported_at
        FROM 
            pets p
        JOIN 
            reported_content r ON p.id = r.item_id AND r.item_type = 'pet'
        WHERE 
            r.status = 'pending'
            
        UNION ALL
        
        -- Flagged Supply Listings
        SELECT 
            ps.id,
            ps.name,
            'supply' AS type,
            r.reporter_id,
            (SELECT name FROM users WHERE id = r.reporter_id) AS reporter_name,
            r.reason,
            r.created_at AS reported_at
        FROM 
            pet_supplies ps
        JOIN 
            reported_content r ON ps.id = r.item_id AND r.item_type = 'supply'
        WHERE 
            r.status = 'pending'
            
        ORDER BY 
            reported_at DESC
    ";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Convert numeric IDs to integers
                $row['id'] = (int)$row['id'];
                $row['reporter_id'] = (int)$row['reporter_id'];
                
                // Add to flagged array
                $response['flagged'][] = $row;
            }

            $response['success'] = true;
            $response['message'] = 'Flagged content fetched successfully.';
            http_response_code(200);
        } else {
            $response['success'] = true;
            $response['message'] = 'No flagged content found.';
            http_response_code(200);
        }
    } else {
        $response['message'] = 'Error executing query: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in get_flagged_content.php: ' . $conn->error);
    }

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in get_flagged_content.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>