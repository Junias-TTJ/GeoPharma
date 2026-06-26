<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function verifierToken() {
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? '';

    if (!$authorization || !str_starts_with($authorization, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['erreur' => 'Token manquant']);
        exit();
    }

    $token = substr($authorization, 7);

    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['erreur' => 'Token invalide ou expiré']);
        exit();
    }
}

function verifierRole($rolesAutorises) {
    $user = verifierToken();
    if (!in_array($user->role, $rolesAutorises)) {
        http_response_code(403);
        echo json_encode(['erreur' => 'Accès non autorisé']);
        exit();
    }
    return $user;
}
?>