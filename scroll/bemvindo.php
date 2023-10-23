<?php
require __DIR__ . '/vendor/autoload.php';
require 'config.php';
require 'database.php';

    $conn = new Database(HB_HOST_SCROLL, DB_USER_SCROLL, DB_PASSWORD_SCROLL, DB_SCROLL);
    $data = json_decode(file_get_contents('php://input', true), true);

    $sessaoCadastrada = $conn->insert("INSERT INTO sessoes SET ip=?, data_hora=?", [ $_SERVER['REMOTE_ADDR'], date("Y-m-d H:i:s") ]);
    $acessoCadastrada = $conn->insert("INSERT INTO acessos SET sessao_id=?, data=?, data_hora=?", [ $sessaoCadastrada, json_encode($data), date("Y-m-d H:i:s") ]);

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'sessao' => $sessaoCadastrada,
        'acesso' => $acessoCadastrada
    ]);
