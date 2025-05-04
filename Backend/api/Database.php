<?php
// Enable error reporting for debugging (remove or set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow cross-origin requests (CORS) - adjust origin in production
header("Access-Control-Allow-Origin: *"); // Consider changing '*' to your frontend domain in production
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request (sent by browsers before POST/PUT/DELETE etc.)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection credentials
$host = "localhost";
$db_name = "tailtrade_db";
$username = "root";
$password = ""; // Default XAMPP/MAMP password is often empty or 'root'

// Create connection

$conn = null;

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Throw exceptions on error
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); // Fetch associative arrays by default
    $conn->exec("set names utf8"); // Ensure UTF-8 encoding
} catch(PDOException $exception) {
    // Don't echo sensitive details in production
    http_response_code(500); // Internal Server Error
    echo json_encode(array(
        "success" => false,
        "message" => "Database connection error. Please try again later."
        // "debug_message" => $exception->getMessage() // Optionally include for debugging only
    ));
    exit(); // Stop script execution if DB connection fails
}

// The $conn variable is now available to any script that includes this file.
?>