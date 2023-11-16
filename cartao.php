<?php

$url = "https://api.z-api.io/instances/3C6521EE2FB730F35F60DEE7CCD1E7D8/token/517534B30217CF5EF6D451B7/send-text";
$phone = "55" . preg_replace('/[^\d\-]/', '',$_POST['celular']);;
$data = [
    'phone' => $phone,
    'message' => "*[MENSAGEM AUTOMÁTICA]*
        
🌟Boom diaa *".$_POST["nome"]."*, tudo bem com você Flor🌺 ? 

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




$url = "https://api.z-api.io/instances/3C6521EE2FB730F35F60DEE7CCD1E7D8/token/517534B30217CF5EF6D451B7/send-text";
$data = [
    'phone' => '5562993702574',
    'message' => "PEDIDO CARTAO CLIENTE",
];
$jsonData = json_encode($data);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Client-Token: Fcc06b4a2419b47e28a5ffdf7127b793cS'));
$response = curl_exec($ch);
curl_close($ch);

