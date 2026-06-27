<?php
require_once __DIR__ . '/config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$route = $_GET['route'] ?? '';

match($route) {
    'auth'        => require_once __DIR__ . '/routes/auth.php',
    'livreur'     => require_once __DIR__ . '/routes/livreur.php',
    'utilisateur' => require_once __DIR__ . '/routes/utilisateur.php',
    default       => (function() {
        http_response_code(404);
        echo json_encode(['erreur' => 'Route introuvable']);
    })()
};
?>