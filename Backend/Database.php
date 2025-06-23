<?php
// Define allowed origins
$allowed_origins = [
    'https://tailtrade.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];

// Get the origin of the current request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if the request origin is in our allowed list
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Optionally, you can set a default or just let the browser block it if origin is not allowed
    // For production, you might only allow your Netlify domain explicitly.
    // For development, it's safer to have the dynamic check.
    // If you always want to allow Netlify, even if other origins aren't matched:
    // header("Access-Control-Allow-Origin: https://tailtrade.netlify.app");
}

// Always set allowed methods and headers for CORS
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS pre-flight request - crucial for CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(); // Terminate script after sending preflight headers
}

// Database Configuration (rest of your Database.php)
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