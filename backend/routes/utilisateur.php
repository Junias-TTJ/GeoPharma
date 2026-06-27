<?php
require_once __DIR__ . '/../middleware/auth.php';

$user = verifierToken();
$id_user = $user->id;
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// PUT - Modifier les infos personnelles
if ($method === 'PUT' && $action === 'modifier-infos') {
    $data = json_decode(file_get_contents('php://input'), true);

    $prenom    = trim($data['prenom'] ?? '');
    $nom       = trim($data['nom'] ?? '');
    $telephone = trim($data['telephone'] ?? '');
    $email     = trim($data['email'] ?? '') ?: null;

    if (!$prenom || !$nom || !$telephone) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Prénom, nom et téléphone sont obligatoires']);
        exit();
    }

    // Vérifier unicité téléphone (exclure l'utilisateur courant)
    $stmt = $pdo->prepare("
        SELECT id_utilisateur FROM Utilisateur 
        WHERE tel = ? AND id_utilisateur != ?
    ");
    $stmt->execute([$telephone, $id_user]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['erreur' => 'Numéro de téléphone déjà utilisé']);
        exit();
    }

    // Vérifier unicité email
    if ($email) {
        $stmt = $pdo->prepare("
            SELECT id_utilisateur FROM Utilisateur 
            WHERE email = ? AND id_utilisateur != ?
        ");
        $stmt->execute([$email, $id_user]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['erreur' => 'Email déjà utilisé']);
            exit();
        }
    }

    $stmt = $pdo->prepare("
        UPDATE Utilisateur 
        SET prenom = ?, nom = ?, tel = ?, email = ?
        WHERE id_utilisateur = ?
    ");
    $stmt->execute([$prenom, $nom, $telephone, $email, $id_user]);

    echo json_encode(['message' => 'Informations mises à jour']);
}

// PUT - Changer le mot de passe
elseif ($method === 'PUT' && $action === 'modifier-mdp') {
    $data = json_decode(file_get_contents('php://input'), true);

    $actuel    = $data['actuel'] ?? '';
    $nouveau   = $data['nouveau'] ?? '';
    $confirmer = $data['confirmer'] ?? '';

    if (!$actuel || !$nouveau || !$confirmer) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Tous les champs sont obligatoires']);
        exit();
    }

    if (strlen($nouveau) < 8) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Le nouveau mot de passe doit contenir au moins 8 caractères']);
        exit();
    }

    if ($nouveau !== $confirmer) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Les mots de passe ne correspondent pas']);
        exit();
    }

    // Récupérer le hash actuel
    $stmt = $pdo->prepare("
        SELECT mot_de_passe FROM Utilisateur WHERE id_utilisateur = ?
    ");
    $stmt->execute([$id_user]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || !password_verify($actuel, $row['mot_de_passe'])) {
        http_response_code(401);
        echo json_encode(['erreur' => 'Mot de passe actuel incorrect']);
        exit();
    }

    $hash = password_hash($nouveau, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("
        UPDATE Utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?
    ");
    $stmt->execute([$hash, $id_user]);

    echo json_encode(['message' => 'Mot de passe mis à jour']);
}

// DELETE - Supprimer le compte
elseif ($method === 'DELETE' && $action === 'supprimer') {
    // Supprimer la table extension selon le rôle
    $role = $user->role;

    $tables = [
        'PATIENT'        => ['Patient', 'id_patient'],
        'LIVREUR'        => ['Livreur', 'id_livreur'],
        'PHARMACIEN'     => ['Pharmacien', 'id_pharmacien'],
        'ADMINISTRATEUR' => ['Administrateur', 'id_administrateur'],
    ];

    if (isset($tables[$role])) {
        [$table, $colonne] = $tables[$role];
        $stmt = $pdo->prepare("DELETE FROM $table WHERE $colonne = ?");
        $stmt->execute([$id_user]);
    }

    $stmt = $pdo->prepare("DELETE FROM Utilisateur WHERE id_utilisateur = ?");
    $stmt->execute([$id_user]);

    echo json_encode(['message' => 'Compte supprimé']);
}

else {
    http_response_code(405);
    echo json_encode(['erreur' => 'Action non reconnue']);
}
?>