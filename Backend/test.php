<?php
// test.php - Upload this to test your backend connection
header("Access-Control-Allow-Origin: https://tailtrade.netlify.app");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Test database connection
$dbHost = 'sql105.infinityfree.com';
$dbUser = 'if0_39297632';
$dbPass = 'xpOCiH81gKsynn';
$dbName = 'if0_39297632_tailtrade_db';

$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

if ($conn->connect_error) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed: ' . $conn->connect_error,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'success' => true, 
        'message' => 'Backend is working! Database connected successfully.',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => $conn->server_info
    ]);
}

$conn->close();
?>