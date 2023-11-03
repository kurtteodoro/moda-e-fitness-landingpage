
if( window.location.search.toUpperCase().indexOf("viewer_scroll_click".toUpperCase()) == -1 ) {
    var sessao = localStorage.getItem("sessao_scroll_click");
    var tamanhoTelaCliente = 707;
    var acesso;

    if(sessao) {
        fetch("/scroll/bemvindo2.php", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tipo: 'bemvindo2',
                time: new Date().getTime(),
                sessao: sessao,
                data: window.location,
                width: window.innerWidth,
                height: window.innerHeight,
                userAgent: navigator.userAgent,
                userAgentData: navigator.userAgentData,
            })
        }).then(r => r.json()).then(data => {
            acesso = data.acesso;
        });
    } else {
        fetch("/scroll/bemvindo.php", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tipo: 'bemvindo',
                time: new Date().getTime(),
                sessao: sessao,
                data: window.location,
                width: window.innerWidth,
                height: window.innerHeight,
                userAgent: navigator.userAgent,
                userAgentData: navigator.userAgentData,
            })
        }).then(r => r.json()).then(data => {
            localStorage.setItem("sessao_scroll_click", data.sessao);
            acesso = data.acesso;
        });
    }

    var buffer = [];
    window.addEventListener("scroll", (event) => {
        const pageHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        )
        buffer.push({pageHeight, tipo: 'scroll', x:window.scrollX, y:window.scrollY, time: new Date().getTime()});
    });
    document.addEventListener("keydown", (event) => {
        buffer.push({tipo: 'keydown', key:event.code, time: new Date().getTime()});
    });
    document.addEventListener("click", (event) => {
        const data = {
            tipo: 'click',
            time: new Date().getTime(),
            x: event.clientX,
            y: event.clientY,
        };
        buffer.push(data);
    });

    window.addEventListener("resize", (event) => {
        buffer.push({
            tipo: 'resize',
            time: new Date().getTime(),
            width: window.innerWidth,
            height: window.innerHeight,
        });
    });

    setInterval(() => {
        if(buffer.length > 0 && acesso) {
            var tmp = [...buffer];
            buffer = [];
            fetch("/scroll/evento.php", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipo: 'data',
                    frames: JSON.stringify(tmp),
                    sessao,
                    acesso
                })
            })
        }
    }, 2000);

} else {

    document.querySelector("html").style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    window.addEventListener('message', event => {
        const evento = JSON.parse(event.data);
        if(evento.tipo == 'scroll') {



            var $click = document.createElement('div');
            $click.innerText = parseInt(evento.y);
            $click.style.fontSize = '50px';
            $click.classList.add("removeeee");
            // $click.style.width = "20px";
            // $click.style.height = "20px";
            $click.style.position = "fixed";
            $click.style.background = "radial-gradient(#ffffff, #9093af)";
            $click.style.border = "4px solid #838fff";
            $click.style.boxShadow = "0px 0px 3px 3px #edf3ff";
            $click.style.right = `25px`;
            $click.style.top = `25px`;
            $click.style.borderRadius = `1000px`;
            $click.style.pointerEvents = `none`;

            document.querySelectorAll(".removeeee").forEach(e => {
                e.remove();
            })

            document.body.appendChild($click);

            var scrto = parseInt(evento.y);
            window.scrollTo(0, (window.outerHeight * evento.y) / tamanhoTelaCliente);
        }
        if(evento.tipo == 'click') {
            simularCliqueNaPosicao(evento.x, evento.y);
        }
    });

    function simularCliqueNaPosicao(x, y) {
        var eventoClique = document.createEvent("MouseEvents");
        eventoClique.initMouseEvent("click", true, true, window, 1, x, y, x, y, false, false, false, false, 0, null);

        var elementoAlvo = document.elementFromPoint(x, y);
        if (elementoAlvo) {
            elementoAlvo.dispatchEvent(eventoClique);
        }
    }
}

