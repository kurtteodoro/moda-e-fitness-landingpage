<?php

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

require __DIR__."/vendor/autoload.php";
function dataAtualMaisDoisDias() {
    // Obtém a data atual
    $dataAtual = new DateTime();

    // Adiciona 2 dias à data atual
    $dataAtual->add(new DateInterval('P2D'));

    // Formata a data no formato desejado
    $dataFormatada = $dataAtual->format('Y-m-d');

    return $dataFormatada;
}

$options = [
    "client_id" => "Client_Id_a8ead3b61b586846a1504904a9805e7d19e8a284",
    "client_secret" => "Client_Secret_a100cbf490544c921a03d654d15e7797a2cd8640",
    "certificate" => __DIR__ . "/producao-374159-art-producao.pem",
    "sandbox" => false,
    "debug" => false,
    "timeout" => 30
];

$items = [
    [
        "name" => "Calcinha com preenchimento",
        "amount" => 1,
        "value" => 120*100
    ],
];

$shippings = [
    [
        "name" => "Frete gratis",
        "value" => 0
    ]
];

$metadata = [
    "custom_id" => $pedido_id = md5(password_hash($_GET["cpf"], PASSWORD_DEFAULT)),
    "notification_url" => "https://calcinha.modaefitness.com.br/notification-hook"
];

$customer = [
    "name" => $_GET["nome"],
    "cpf" => $_GET["cpf"],
     "email" => $_GET["email"],
     "phone_number" => $_GET["celular"],
    // "birth" => "",
     "address" => [
     	"street" => $_GET["endereco"],
     	"number" => $_GET["numero"],
     	"neighborhood" => $_GET["bairro"],
     	"zipcode" => $_GET["cep"],
//     	"city" => "",
     	"complement" => $_GET["complemento"],
//     	"state" => "",
//     	"juridical_person" => "",
//     	"corporate_name" => "",
//     	"cnpj" => ""
     ],
];

$bankingBillet = [
    "expire_at" => dataAtualMaisDoisDias(),
    "message" => "Obrigado por escolher a Moda & Fitness! Sua compra é muito importante para nós.",
    "customer" => $customer,
];

$payment = [
    "banking_billet" => $bankingBillet
];

$body = [
    "items" => $items,
    "shippings" => $shippings,
    "metadata" => $metadata,
    "payment" => $payment
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

    $response = $api->createOneStepCharge($params = [], $body);
    if($response["code"] == 200) {
        $body["response"] = $response;
        file_put_contents(__DIR__.'/vendas/'.time() . '-' . $pedido_id . '.json', json_encode($body));
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response);

        enviarMensagemCliente($_GET["celular"], $_GET["nome"]);
        enviarBoletoCliente($_GET["celular"], $response["data"]["pdf"]["charge"]);

        $url = "https://api.z-api.io/instances/3C6521EE2FB730F35F60DEE7CCD1E7D8/token/517534B30217CF5EF6D451B7/send-text";
        $data = [
            'phone' => '5562993702574',
            'message' => "PEDIDO BOLETO CLIENTE",
        ];
        $jsonData = json_encode($data);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Client-Token: Fcc06b4a2419b47e28a5ffdf7127b793cS'));
        $response = curl_exec($ch);
        curl_close($ch);



        die;
    } else
        throw \Exception("Erro, status != 200");
} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);
    print("2");
} catch (Exception $e) {
    print_r($e->getMessage());
    print("3");
}


function enviarBoletoCliente($telefone, $boleto) {
    $url = "https://api.z-api.io/instances/3C6521EE2FB730F35F60DEE7CCD1E7D8/token/517534B30217CF5EF6D451B7/send-document/pdf";
    $phone = "55" . $telefone;;
    $data = [
        'phone' => $phone,
        'document' => $boleto,
        'fileName' => 'Boleto de pagamento',
        'caption' => "Realize o pagamento do Boleto em até 2 dias, caso precise de ajuda lembre-se que pode me chamar aqui a qualquer momento 😉"
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
        'message' => "*[MENSAGEM AUTOMÁTICA]*
        
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