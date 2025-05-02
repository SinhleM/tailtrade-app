<?php
// Include database connection and CORS headers
require_once 'Database.php'; // Make sure the path is correct

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("success" => false, "message" => "Only POST method is allowed"));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Basic Validation - Check if required fields exist and are not empty
$required_fields = ['owner_id', 'name', 'type', 'breed', 'age', 'price', 'location', 'description', 'image_url'];
foreach ($required_fields as $field) {
    if (!isset($data->$field) || empty(trim(strval($data->$field)))) {
        http_response_code(400); // Bad Request
        echo json_encode(array("success" => false, "message" => ucfirst(str_replace('_', ' ', $field)) . " is required"));
        exit();
    }
}

// Data Type Validation
if (!is_numeric($data->owner_id) || intval($data->owner_id) <= 0) {
     http_response_code(400);
     echo json_encode(array("success" => false, "message" => "Invalid Owner ID"));
     exit();
}
if (!is_numeric($data->age) || intval($data->age) < 0) {
     http_response_code(400);
     echo json_encode(array("success" => false, "message" => "Age must be a non-negative number"));
     exit();
}
if (!is_numeric($data->price) || floatval($data->price) < 0) {
     http_response_code(400);
     echo json_encode(array("success" => false, "message" => "Price must be a non-negative number"));
     exit();
}
$allowed_types = ['dog', 'cat'];
if (!in_array(strtolower($data->type), $allowed_types)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Invalid pet type. Must be 'dog' or 'cat'"));
    exit();
}

// Sanitize input data (Basic sanitization)
$owner_id = intval($data->owner_id);
$name = htmlspecialchars(strip_tags(trim($data->name)));
$type = htmlspecialchars(strip_tags(trim(strtolower($data->type))));
$breed = htmlspecialchars(strip_tags(trim($data->breed)));
$age = intval($data->age);
$price = floatval($data->price);
$location = htmlspecialchars(strip_tags(trim($data->location)));
$description = htmlspecialchars(strip_tags(trim($data->description)));
$image_url = filter_var(trim($data->image_url), FILTER_SANITIZE_URL); // Basic URL sanitization

// Validate image URL format (optional but recommended)
if (!filter_var($image_url, FILTER_VALIDATE_URL)) {
     http_response_code(400);
     echo json_encode(array("success" => false, "message" => "Invalid Image URL format"));
     exit();
}


// SQL query to insert new pet
// Using CURRENT_TIMESTAMP for created_at as defined in the table schema
$query = "INSERT INTO pets (owner_id, name, type, breed, age, price, location, description, image_url, created_at)
          VALUES (:owner_id, :name, :type, :breed, :age, :price, :location, :description, :image_url, NOW())";

try {
    // Prepare the query
    $stmt = $conn->prepare($query);

    // Bind parameters
    $stmt->bindParam(":owner_id", $owner_id, PDO::PARAM_INT);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":type", $type);
    $stmt->bindParam(":breed", $breed);
    $stmt->bindParam(":age", $age, PDO::PARAM_INT);
    $stmt->bindParam(":price", $price); // PDO handles float/decimal conversion
    $stmt->bindParam(":location", $location);
    $stmt->bindParam(":description", $description);
    $stmt->bindParam(":image_url", $image_url);

    // Execute the query
    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode(array(
            "success" => true,
            "message" => "Pet listed successfully"
            // Optionally return the ID: "pet_id" => $conn->lastInsertId()
        ));
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("success" => false, "message" => "Unable to list pet"));
    }
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    // Log error details internally instead of exposing to the user
    // error_log("Database error in list_pet.php: " . $e->getMessage());
    echo json_encode(array("success" => false, "message" => "An internal error occurred. Please try again later."));
     // Optionally add debug message: "debug_message" => $e->getMessage()
}
?>