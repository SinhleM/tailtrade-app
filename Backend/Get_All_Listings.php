<?php
// Include the database connection and common headers
require 'Database.php'; // This already includes CORS headers

// --- Prepare an array for the JSON response ---
$response = ['success' => false, 'listings' => [], 'message' => ''];

try {
    // --- SQL Query to fetch pets and pet_supplies ---
    // We use UNION ALL to combine results from both tables.
    // It's important that both parts of the UNION have the same number of columns
    // and compatible data types. We'll alias columns to have consistent names.
    // We also add a 'listing_type' column to distinguish between pets and supplies.

    $sql = "
        SELECT
            id,
            owner_id,
            name,
            type,          -- For pets, this is 'dog' or 'cat'
            breed,
            age,
            price,
            location,
            description,
            image_url,
            created_at,
            'pet' AS listing_type, -- Add a type identifier for pets
            NULL AS `condition`    -- Add a NULL condition column for pets to match supplies table
        FROM
            pets
        UNION ALL
        SELECT
            id,
            owner_id,
            name,
            NULL AS type,          -- Supplies don't have a 'type' like 'dog'/'cat'
            NULL AS breed,         -- Supplies don't have a 'breed'
            NULL AS age,           -- Supplies don't have an 'age'
            price,
            location,
            description,
            image_url,
            created_at,
            'supply' AS listing_type, -- Add a type identifier for supplies
            `condition`              -- Condition for supplies
        FROM
            pet_supplies
        ORDER BY
            created_at DESC; -- Optionally order by creation date or another field
    ";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Ensure numeric types are correctly cast if needed, though fetch_assoc usually handles it.
                $row['id'] = (int)$row['id'];
                $row['owner_id'] = (int)$row['owner_id'];
                if ($row['age'] !== null) {
                    $row['age'] = (int)$row['age'];
                }
                $row['price'] = (float)$row['price'];
                $response['listings'][] = $row;
            }
            $response['success'] = true;
            $response['message'] = 'Listings fetched successfully.';
            http_response_code(200); // OK
        } else {
            $response['success'] = true; // Success, but no listings found
            $response['message'] = 'No listings found.';
            http_response_code(200); // OK
        }
    } else {
        // SQL query execution error
        $response['message'] = 'Error executing query: ' . $conn->error;
        http_response_code(500); // Internal Server Error
        error_log('SQL Error in get_all_listings.php: ' . $conn->error); // Log the error
    }

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500); // Internal Server Error
    error_log('Exception in get_all_listings.php: ' . $e->getMessage()); // Log the error
}

// --- Close Connection ---
$conn->close();

// --- Send JSON Response ---
echo json_encode($response);
?>
