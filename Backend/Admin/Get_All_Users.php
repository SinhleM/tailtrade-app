<?php
require '../Database.php'; 

// Check if user is admin (basic authorization check)
$response = ['success' => false, 'users' => [], 'message' => ''];

try {
    // Fetch all users from the database
    $sql = "
        SELECT 
            id, 
            name, 
            email, 
            role, 
            created_at 
        FROM 
            users 
        ORDER BY 
            created_at DESC
    ";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Convert numeric fields to appropriate types
                $row['id'] = (int)$row['id'];
                
                // Add the user to the users array
                $response['users'][] = $row;
            }

            $response['success'] = true;
            $response['message'] = 'Users fetched successfully.';
            http_response_code(200);
        } else {
            $response['success'] = true;
            $response['message'] = 'No users found.';
            http_response_code(200);
        }
    } else {
        $response['message'] = 'Error executing query: ' . $conn->error;
        http_response_code(500);
        error_log('SQL Error in get_all_users.php: ' . $conn->error);
    }

} catch (Exception $e) {
    $response['message'] = 'An unexpected error occurred: ' . $e->getMessage();
    http_response_code(500);
    error_log('Exception in get_all_users.php: ' . $e->getMessage());
}

$conn->close();
echo json_encode($response);
?>