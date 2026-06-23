<?php

define('DB_HOST', 'votre_host');        
define('DB_NAME', 'votre_base');        
define('DB_USER', 'votre_utilisateur'); 
define('DB_PASS', 'votre_mot_de_passe');

define('JWT_SECRET', 'votre_cle_secrete_longue_et_aleatoire');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erreur' => 'Connexion BDD échouée']);
    exit();
}
?>