<?php
// Ensure CORS headers are set correctly and early
header("Access-Control-Allow-Origin: https://tailtrade.netlify.app"); // Your Netlify domain
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS pre-flight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Configuration
$dbHost = 'sql105.infinityfree.com';
$dbUser = 'if0_39297632';
$dbPass = 'xpOCiH81gKsynn';
$dbName = 'if0_39297632_tailtrade_db';

// Create Connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

// Check Connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database Connection Error: ' . $conn->connect_error]);
    exit();
}

// Set character set to utf8mb4 for proper encoding
$conn->set_charset("utf8mb4");

// Note: We don't close the connection here; it will be included and used by other files.
// PHP automatically closes the connection when the script finishes.
?>