<?php
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

require __DIR__ . '/vendor/autoload.php';
require 'database.php';

class MyChat implements MessageComponentInterface {
    protected $clients;
    public $conn;

    public function __construct() {
        $this->conn = new Database("127.0.0.1:3310", "root", "", 'scroll_click');
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
    }

    public function onMessage(ConnectionInterface $client, $msg) {
        $txt = $msg;
        $msg = json_decode($msg);
        if($msg->tipo == 'bemvindo') {
            $sessaoCadastrada = $this->conn->insert("INSERT INTO sessoes SET ip=?, data_hora=?", [ $client->remoteAddress, date("Y-m-d H:i:s") ]);
            $client->send(json_encode([
                "tipo" => "bemvindo",
                'sessao' => $sessaoCadastrada
            ]));
        }

        if($msg->tipo == 'bemvindo2') {
            $acessoCadastrada = $this->conn->insert("INSERT INTO acessos SET sessao_id=?, data=?, data_hora=?", [ $msg->sessao, $txt, date("Y-m-d H:i:s") ]);
            $client->send(json_encode([
                "tipo" => "setacesso",
                'acesso' => $acessoCadastrada
            ]));
        }

        if($msg->tipo == 'data') {
            $eventos = json_decode($msg->frames);
            foreach ($eventos as $evento) {
                $this->conn->query("INSERT INTO eventos SET acesso_id=?, evento=?, data_hora=?", [ $msg->acesso, json_encode($evento), date("Y-m-d H:i:s") ]);
            }
        }

    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $conn->close();
    }
}

// Run the server application through the WebSocket protocol on port 8080
$app = new Ratchet\App('localhost', 8080);
$app->route('/chat', new MyChat, array('*'));
$app->run();