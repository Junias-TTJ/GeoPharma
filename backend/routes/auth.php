<?php
require_once '../config.php';
require_once '../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// INSCRIPTION

if ($method === 'POST' && $action === 'inscription') {
    $data = json_decode(file_get_contents('php://input'), true);

    $nom      = $data['nom'] ?? '';
    $prenom   = $data['prenom'] ?? '';
    $tel      = $data['tel'] ?? '';
    $email    = $data['email'] ?? null;
    $password = $data['mot_de_passe'] ?? '';
    $role     = $data['role'] ?? 'PATIENT';

    // Validation basique
    if (!$nom || !$prenom || !$tel || !$password) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Veuillez remplir les champs obligatoires']);
        exit();
    }

    // pour tel unique
    $stmt = $pdo->prepare("SELECT id_utilisateur FROM Utilisateur WHERE tel = ?");
    $stmt->execute([$tel]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['erreur' => 'Numéro de téléphone déjà utilisé']);
        exit();
    }

    // email unique 
    if ($email) {
        $stmt = $pdo->prepare("SELECT id_utilisateur FROM Utilisateur WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['erreur' => 'Email déjà utilisé']);
            exit();
        }
    }

    // Validation spécifique livreur/pharmacien
    if (in_array($role, ['LIVREUR', 'PHARMACIEN'])) {
        $id_pharmacie = $data['id_pharmacie'] ?? null;
        if (!$id_pharmacie) {
            http_response_code(400);
            echo json_encode(['erreur' => 'Veuillez sélectionner votre pharmacie']);
            exit();
        }
        // Vérifier que la pharmacie existe
        $stmt = $pdo->prepare("SELECT id_pharmacie FROM Pharmacie WHERE id_pharmacie = ?");
        $stmt->execute([$id_pharmacie]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['erreur' => 'Pharmacie introuvable']);
            exit();
        }
    }

    // bcrypt hash mdp
    $hash = password_hash($password, PASSWORD_BCRYPT);

    // Si l'user est patient le compte est operationnel dans le cas contraire, l'admin doit active le compte
    $statut = $role === 'PATIENT' ? 'ACTIF' : 'EN_ATTENTE_VALIDATION';

    // Insertion Utilisateur
    $stmt = $pdo->prepare("
        INSERT INTO Utilisateur 
        (nom, prenom, tel, email, mot_de_passe, role, statut_compte)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$nom, $prenom, $tel, $email, $hash, $role, $statut]);
    $id = $pdo->lastInsertId();

    // Insertion table extension selon rôle
    if ($role === 'PATIENT') {
        $adresse   = $data['adresse'] ?? null;
        $latitude  = $data['latitude'] ?? null;
        $longitude = $data['longitude'] ?? null;
        $stmt = $pdo->prepare("
            INSERT INTO Patient (id_patient, adresse, latitude, longitude)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$id, $adresse, $latitude, $longitude]);

    } elseif ($role === 'LIVREUR') {
        $id_pharmacie = $data['id_pharmacie'];
        $stmt = $pdo->prepare("
            INSERT INTO Livreur (id_livreur, id_pharmacie)
            VALUES (?, ?)
        ");
        $stmt->execute([$id, $id_pharmacie]);

    } elseif ($role === 'PHARMACIEN') {
        $stmt = $pdo->prepare("
            INSERT INTO Pharmacien (id_pharmacien)
            VALUES (?)
        ");
        $stmt->execute([$id]);
        // Rattacher le pharmacin à la pharmacie
        $id_pharmacie = $data['id_pharmacie'];
        $stmt = $pdo->prepare("
            UPDATE Pharmacie SET id_pharmacien = ?
            WHERE id_pharmacie = ?
        ");
        $stmt->execute([$id, $id_pharmacie]);

    } elseif ($role === 'ADMINISTRATEUR') {
        $stmt = $pdo->prepare("
            INSERT INTO Administrateur (id_administrateur)
            VALUES (?)
        ");
        $stmt->execute([$id]);
    }

    http_response_code(201);
    echo json_encode(['message' => 'Compte créé avec succès', 'id' => $id]);
}

// CONNEXION

elseif ($method === 'POST' && $action === 'connexion') {
    $data = json_decode(file_get_contents('php://input'), true);

    $telephone = $data['telephone'] ?? '';
    $password  = $data['mot_de_passe'] ?? '';

    if (!$telephone || !$password) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Téléphone et mot de passe requis']);
        exit();
    }

    // Chercher par téléphone OU email
    $stmt = $pdo->prepare("
        SELECT * FROM Utilisateur 
        WHERE tel = ? OR email = ?
    ");
    $stmt->execute([$telephone, $telephone]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['mot_de_passe'])) {
        http_response_code(401);
        echo json_encode(['erreur' => 'Identifiant ou mot de passe incorrect']);
        exit();
    }

    if ($user['statut_compte'] === 'SUSPENDU') {
        http_response_code(403);
        echo json_encode(['erreur' => 'Compte suspendu']);
        exit();
    }

    if ($user['statut_compte'] === 'EN_ATTENTE_VALIDATION') {
        http_response_code(403);
        echo json_encode(['erreur' => 'Compte en attente de validation']);
        exit();
    }

    // Générer token JWT
    $payload = [
        'id'   => $user['id_utilisateur'],
        'role' => $user['role'],
        'exp'  => time() + (60 * 60 * 24) // 24h
    ];

    $token = JWT::encode($payload, JWT_SECRET, 'HS256');

    echo json_encode([
        'token' => $token,
        'user'  => [
            'id'     => $user['id_utilisateur'],
            'nom'    => $user['nom'],
            'prenom' => $user['prenom'],
            'role'   => $user['role']
        ]
    ]);
}

else {
    http_response_code(405);
    echo json_encode(['erreur' => 'Méthode non autorisée']);
}
?>