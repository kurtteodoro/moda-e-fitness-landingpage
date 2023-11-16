<?php

$tmp = rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9);
$DATA = [
    "POST" => $_POST,
    "GET" => $_GET,
];
file_put_contents(__DIR__.'/notificacoes/'.time() . '-' . $tmp . '.json', json_encode($DATA));
