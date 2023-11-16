<?php
use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

require __DIR__.'/vendor/autoload.php';

$tmp = rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9) . rand(0, 9);
$DATA = [
    "POST" => $_POST,
    "GET" => $_GET,
];
file_put_contents(__DIR__.'/vendas/'.time() . '-' . $tmp . '.json', json_encode($DATA));

    $CPF_Pagador = $_GET["cpf"];
    $nomePagador = $_GET["name"];
    $valor = '114';
$body = [
    "calendario" => [
        "expiracao" => 3600
    ],
        "devedor" => [
            "cpf" => $CPF_Pagador,
            "nome" => $nomePagador
        ],
    "valor" => [
        "original" => number_format(floatval($valor), 2)
    ],
    "chave" => "7d3ecf5a-93bd-4328-a935-e9a4459ed25c", // Chave pix da conta Gerencianet do recebedor
    "solicitacaoPagador" => "Moda & Fitness",
    "infoAdicionais" => [
        [
            "nome" => "Calcinha modeladora ", // Nome do campo string (Nome) ≤ 50 characters
            "valor" => "Calcinha modeladora com preenchimento" // Dados do campo string (Valor) ≤ 200 characters
        ]
    ]
];

try {
    $api = Gerencianet::getInstance([
        "client_id" => "Client_Id_a8ead3b61b586846a1504904a9805e7d19e8a284",
        "client_secret" => "Client_Secret_a100cbf490544c921a03d654d15e7797a2cd8640",
        "pix_cert" => __DIR__ . "/producao-374159-art-producao.pem",
        "sandbox" => false,
        "debug" => false,
        "timeout" => 30
    ]);

    $pix = $api->pixCreateImmediateCharge([], $body);

    file_put_contents(__DIR__.'/vendas/'.time() . '-' . $tmp . '_.json', json_encode($pix));


    if ($pix['txid']) {
        $params = [
            'id' => $pix['loc']['id']
        ];

        // Gera QRCode
        $qrcode = $api->pixGenerateQRCode($params);
        file_put_contents(__DIR__.'/vendas/'.time() . '-' . $tmp . '__.json', json_encode($qrcode));

        if($qrcode["qrcode"] && $qrcode["imagemQrcode"]) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                "qrcode" => $qrcode["qrcode"],
                "imagemQrcode" => $qrcode["imagemQrcode"],
                "sucesso" => true
            ]);

            enviarMensagemCliente(preg_replace('/[^\d\-]/', '',$_GET["celular"]), $_GET["name"]);
            enviarPix(preg_replace('/[^\d\-]/', '',$_GET["celular"]), $qrcode["qrcode"]);

            $url = "https://api.z-api.io/instances/3C6521EE2FB730F35F60DEE7CCD1E7D8/token/517534B30217CF5EF6D451B7/send-text";
            $data = [
                'phone' => '5562993702574',
                'message' => "PEDIDO PIX CLIENTE",
            ];
            $jsonData = json_encode($data);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Client-Token: Fcc06b4a2419b47e28a5ffdf7127b793cS'));
            $response = curl_exec($ch);
            curl_close($ch);

        }
        else
            echo "ERROR";

    } else {
        echo "ERROR";
    }
} catch (GerencianetException $e) {
    echo json_encode($e->getMessage());
} catch (Exception $e) {
    echo json_encode("CASTELO");
}


function enviarPix($telefone, $pix) {
    $url = "https://api.z-api.io/instances/3C6521EE2FB730F35F60DEE7CCD1E7D8/token/517534B30217CF5EF6D451B7/send-text";
    $phone = "55" . $telefone;;
    $data = [
        'phone' => $phone,
        'message' => $pix,
    ];
    $jsonData = json_encode($data);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Client-Token: Fcc06b4a2419b47e28a5ffdf7127b793cS'));
    $response = curl_exec($ch);
    curl_close($ch);

    $data = [
        'phone' => $phone,
        'message' => "Realize o pagamento do PIX em até 30 minutos, caso precise de ajuda lembre-se que pode me chamar aqui a qualquer momento 😉",
    ];
    $jsonData = json_encode($data);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Client-Token: Fcc06b4a2419b47e28a5ffdf7127b793cS'));
    $response = curl_exec($ch);
    curl_close($ch);
}

function enviarMensagemCliente($telefone, $nomeCliente) {
    $url = "https://api.z-api.io/instances/3C6521EE2FB730F35F60DEE7CCD1E7D8/token/517534B30217CF5EF6D451B7/send-text";
    $phone = "55" . $telefone;;
    $data = [
    'phone' => $phone,
    'message' => "*[MENSAGEM AUTOMÁTICA]*:
    
🌟Boom diaa *".$nomeCliente."*, tudo bem com você Flor🌺 ?

Obrigado por escolher a *Moda & Fitness! Sua compra é muito importante para nós.* Nosso time já está separando seu pedido e assim que o *pagamento for compensado* sairá para entrega e você receberá o *código de rastrear* via E-mail e Whatsapp, o prazo é de 2 a 15 dias.

Ahh, e não se esqueça que se tiver qualquer dúvida, você pode me chamar aqui. Tá bom ? ✨

Nós agradecemos e desejamos um ótimo dia 🌟😊",
    ];
    $jsonData = json_encode($data);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Client-Token: Fcc06b4a2419b47e28a5ffdf7127b793cS'));
    $response = curl_exec($ch);
    curl_close($ch);
}
