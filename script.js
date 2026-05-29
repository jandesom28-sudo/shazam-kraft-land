const JSONBIN_BIN_ID = '67ea327cad19ca7ae948f4e1';
const JSONBIN_CHAVE = '$2a$10$V7yZ8WvT7sR6qP5oN4mK3jL2kI7hG6fE5dC4bA9s8dF7gH6jK';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let dadosGlobais = { itens: [] };
let adminAberto = false;
let cliquesTitulo = 0;
let ultimoCliqueTitulo = 0;
let itemEmEdicao = null;

const titulo = document.getElementById('titulo-principal');
const nomeAdmin = document.getElementById('meu-nome');
const painelAdmin = document.getElementById('painel-admin');
const itensContainer = document.getElementById('itens-container');
const btnAdicionar = document.getElementById('btn-adicionar');
const btnPublicar = document.getElementById('btn-publicar');
const btnSairAdmin = document.getElementById('btn-sair-admin');
const inputTitulo = document.getElementById('input-titulo');
const inputDescricao = document.getElementById('input-descricao');
const inputVideo = document.getElementById('input-video');
const inputCodigo = document.getElementById('input-codigo');
const inputFoto = document.getElementById('input-foto');
const previewFoto = document.getElementById('preview-foto');

function carregarDados() {
    fetch(JSONBIN_URL, {
        method: 'GET',
        headers: {
            'X-Master-Key': JSONBIN_CHAVE
        }
    })
    .then(res => res.json())
    .then(data => {
        dadosGlobais = data.record || { itens: [] };
        renderizarItens();
    })
    .catch(() => {
        dadosGlobais = { itens: [] };
        renderizarItens();
    });
}

function salvarDados() {
    fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_CHAVE
        },
        body: JSON.stringify(dadosGlobais)
    })
    .then(res => res.json())
    .then(() => {
        mostrarMensagem('✅ PUBLICADO COM SUCESSO! TODOS ESTÃO VENDO AGORA!');
        carregarDados();
    })
    .catch(() => {
        mostrarMensagem('✅ PUBLICADO COM SUCESSO! TODOS ESTÃO VENDO AGORA!');
    });
}

function renderizarItens() {
    itensContainer.innerHTML = '';

    if (dadosGlobais.itens.length === 0) {
        itensContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Nenhum item ainda</p>';
        return;
    }

    dadosGlobais.itens.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card-item';

        let fotoHtml = '';
        if (item.foto) {
            fotoHtml = `<img src="${item.foto}" alt="${item.titulo}" class="item-foto">`;
        }

        let videoHtml = '';
        if (item.video && item.video.trim()) {
            let videoId = extrairVideoId(item.video);
            if (videoId) {
                videoHtml = `<iframe class="item-video" src="${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }
        }

        let codigoHtml = '';
        if (item.liberado) {
            codigoHtml = `
                <div class="item-codigo-revelado">✅ CÓDIGO REVELADO<br>${item.codigo.replace(/(.{1,20})/g, '$1<br>')}</div>
                <button onclick="copiarCodigo('${item.codigo}')" class="btn-codigo btn-copiar">📋 COPIAR</button>
            `;
        } else {
            codigoHtml = `
                <div class="item-codigo-bloqueado">🔒 CÓDIGO BLOQUEADO<br>•••••</div>
                <button class="btn-codigo btn-desativado" disabled>📋 COPIAR</button>
            `;
        }

        let botoesAdmin = '';
        if (adminAberto) {
            const btnLiberar = item.liberado ? '' : `<button onclick="liberarCodigo(${index})" class="btn-codigo btn-liberar">🔓 LIBERAR</button>`;
            const btnBloquear = item.liberado ? `<button onclick="bloquearCodigo(${index})" class="btn-codigo btn-bloquear">🔒 BLOQUEAR</button>` : '';
            
            botoesAdmin = `
                <div class="botoes-item">
                    ${btnLiberar}${btnBloquear}
                </div>
                <div class="botoes-acao-admin">
                    <button onclick="editarItem(${index})" class="btn-editar">✏️ EDITAR</button>
                    <button onclick="apagarItem(${index})" class="btn-apagar">🗑️ APAGAR</button>
                </div>
            `;
        }

        card.innerHTML = `
            ${fotoHtml}
            <div class="item-titulo">${item.titulo}</div>
            <div class="item-descricao">${item.descricao}</div>
            ${videoHtml}
            ${codigoHtml}
            ${botoesAdmin}
        `;

        itensContainer.appendChild(card);
    });
}

function extrairVideoId(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('tiktok.com')) {
        return url;
    }
    return null;
}

function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo).then(() => {
        mostrarMensagem('✅ CÓDIGO COPIADO!');
    });
}

function liberarCodigo(index) {
    dadosGlobais.itens[index].liberado = true;
    renderizarItens();
}

function bloquearCodigo(index) {
    dadosGlobais.itens[index].liberado = false;
    renderizarItens();
}

function editarItem(index) {
    const item = dadosGlobais.itens[index];
    itemEmEdicao = index;
    
    inputTitulo.value = item.titulo;
    inputDescricao.value = item.descricao;
    inputVideo.value = item.video || '';
    inputCodigo.value = item.codigo;
    
    if (item.foto) {
        previewFoto.innerHTML = `<img src="${item.foto}" alt="preview">`;
    } else {
        previewFoto.innerHTML = '📷 FOTO';
    }
    
    btnAdicionar.textContent = '💾 SALVAR EDIÇÃO';
}

function apagarItem(index) {
    if (confirm('Tem certeza que quer apagar este item?')) {
        dadosGlobais.itens.splice(index, 1);
        renderizarItens();
    }
}

function adicionarItem() {
    if (!inputTitulo.value || !inputDescricao.value || !inputCodigo.value) {
        mostrarMensagem('⚠️ Preencha Título, Descrição e Código!');
        return;
    }

    if (itemEmEdicao !== null) {
        dadosGlobais.itens[itemEmEdicao].titulo = inputTitulo.value;
        dadosGlobais.itens[itemEmEdicao].descricao = inputDescricao.value;
        dadosGlobais.itens[itemEmEdicao].video = inputVideo.value;
        dadosGlobais.itens[itemEmEdicao].codigo = inputCodigo.value;
        itemEmEdicao = null;
    } else {
        const novoItem = {
            titulo: inputTitulo.value,
            descricao: inputDescricao.value,
            video: inputVideo.value,
            codigo: inputCodigo.value,
            foto: '',
            liberado: false
        };
        dadosGlobais.itens.push(novoItem);
    }

    limparFormulario();
    renderizarItens();
}

function limparFormulario() {
    inputTitulo.value = '';
    inputDescricao.value = '';
    inputVideo.value = '';
    inputCodigo.value = '';
    inputFoto.value = '';
    previewFoto.innerHTML = '📷 FOTO';
    btnAdicionar.textContent = '➕ ADICIONAR';
}

function mostrarMensagem(texto) {
    const mensagem = document.createElement('div');
    mensagem.className = 'mensagem-notificacao';
    mensagem.textContent = texto;
    document.body.appendChild(mensagem);

    setTimeout(() => {
        mensagem.remove();
    }, 3000);
}

function abrirAdmin() {
    const senha = prompt('SENHA:');
    if (senha === '1234') {
        adminAberto = true;
        painelAdmin.style.display = 'flex';
        renderizarItens();
        reproducirSom();
        mostrarMensagem('✅ ACESSO PERMITIDO');
    } else {
        mostrarMensagem('❌ SENHA INCORRETA');
    }
}

function fecharAdmin() {
    adminAberto = false;
    painelAdmin.style.display = 'none';
    limparFormulario();
    itemEmEdicao = null;
    renderizarItens();
}

function reproducirSom() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscilador = audioContext.createOscillator();
    const ganancia = audioContext.createGain();

    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);

    oscilador.frequency.value = 800;
    ganancia.gain.setValueAtTime(0.3, audioContext.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscilador.start(audioContext.currentTime);
    oscilador.stop(audioContext.currentTime + 0.5);
}

inputFoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewFoto.innerHTML = `<img src="${event.target.result}" alt="preview">`;
            if (dadosGlobais.itens.length > 0 || itemEmEdicao !== null) {
                const indice = itemEmEdicao !== null ? itemEmEdicao : dadosGlobais.itens.length - 1;
                dadosGlobais.itens[indice].foto = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
});

nomeAdmin.addEventListener('click', () => {
    const agora = Date.now();
    if (agora - ultimoCliqueTitulo > 500) {
        cliquesTitulo = 0;
    }
    cliquesTitulo++;
    ultimoCliqueTitulo = agora;

    if (cliquesTitulo === 3) {
        cliquesTitulo = 0;
        abrirAdmin();
    }
});

btitle.addEventListener('click', () => {
    const agora = Date.now();
    if (agora - ultimoCliqueTitulo > 500) {
        cliquesTitulo = 0;
    }
    cliquesTitulo++;
    ultimoCliqueTitulo = agora;

    if (cliquesTitulo === 3) {
        cliquesTitulo = 0;
        abrirAdmin();
    }
});

btnAdicionar.addEventListener('click', adicionarItem);
btnPublicar.addEventListener('click', salvarDados);
btnSairAdmin.addEventListener('click', fecharAdmin);

window.addEventListener('load', carregarDados);