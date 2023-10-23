var sessao = localStorage.getItem("sessao_scroll_click");
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
document.addEventListener("scroll", (event) => {
    buffer.push({tipo: 'scroll', x:window.scrollX, y:window.scrollY, time: new Date().getTime()});
});
document.addEventListener("keydown", (event) => {
    buffer.push({tipo: 'keydown', key:event.code, time: new Date().getTime()});
});
document.addEventListener("click", (event) => {
    buffer.push({
        tipo: 'click',
        time: new Date().getTime(),
        x: event.clientX,
        y: event.clientY,
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