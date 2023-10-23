<?php
require __DIR__ . '/vendor/autoload.php';
require 'config.php';
require 'database.php';

$conn = new Database(HB_HOST_SCROLL, DB_USER_SCROLL, DB_PASSWORD_SCROLL, DB_SCROLL);
$data = json_decode(file_get_contents('php://input', true), true);

$eventos = json_decode($data["frames"]);

foreach ($eventos as $evento) {
    $conn->query("INSERT INTO eventos SET acesso_id=?, evento=?, data_hora=?", [ $data['acesso'], json_encode($evento), date("Y-m-d H:i:s") ]);
}