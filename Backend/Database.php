<?php

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");



// --- Handle OPTIONS request (pre-flight) ---
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Database Configuration ---
$dbHost = 'localhost'; // Usually localhost for XAMPP
$dbUser = 'root';      // Default XAMPP username (change if you have a different one)
$dbPass = '';          // Default XAMPP password (change if you set one)
$dbName = 'tailtrade_db'; // Your database name [cite: 1]

// --- Create Connection ---
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

// --- Check Connection ---
if ($conn->connect_error) {

    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database Connection Error: ' . $conn->connect_error]);
    exit(); // Stop script execution if connection fails
}

// Set character set to utf8mb4 for proper encoding
$conn->set_charset("utf8mb4");

// Note: We don't close the connection here; it will be included and used by other files.
// PHP automatically closes the connection when the script finishes.
?>