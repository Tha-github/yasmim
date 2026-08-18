// ==========================================================================
// MAIN.JS — Yasmim dos Santos Pinho | Site institucional
// ==========================================================================

// Número de WhatsApp para contato (formato: código do país + DDD + número)
// TROCAR AQUI: substituir pelo número real fornecido pela cliente
const WHATSAPP_NUMBER = '5511999999999';

/**
 * Monta a URL do WhatsApp (wa.me) com uma mensagem pré-codificada.
 * @param {string} mensagem - Texto que será preenchido na conversa.
 * @returns {string} URL completa do wa.me pronta para uso em um link.
 */
function linkWhatsApp(mensagem) {
  const textoCodificado = encodeURIComponent(mensagem);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${textoCodificado}`;
}

/**
 * Envia um evento para o dataLayer do Google Tag Manager/GA4. Funciona
 * mesmo que a Google Tag ainda não tenha sido configurada (o array
 * dataLayer só fica "pendurado" até a tag real processá-lo).
 * @param {string} nomeEvento - Nome do evento (ex.: 'clique_whatsapp').
 * @param {Object} [dados] - Parâmetros extras do evento.
 */
function registrarEventoGTM(nomeEvento, dados = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: nomeEvento, ...dados });
}

/**
 * Faz todo elemento com a classe .js-whatsapp-cta abrir o WhatsApp em uma
 * nova aba, usando a mensagem definida em data-mensagem (ou uma padrão).
 * Também registra um evento no dataLayer para a cliente medir os cliques
 * de WhatsApp na Google Tag (GTM/GA4).
 */
function inicializarLinksWhatsApp() {
  const botoesWhatsApp = document.querySelectorAll('.js-whatsapp-cta');

  botoesWhatsApp.forEach((botao) => {
    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      const mensagem = botao.dataset.mensagem || 'Olá! Gostaria de agendar uma sessão.';
      registrarEventoGTM('clique_whatsapp', { whatsapp_origem: mensagem });
      window.open(linkWhatsApp(mensagem), '_blank', 'noopener');
    });
  });
}

/**
 * Esconde imagens placeholder que ainda não existem no /assets (404),
 * deixando visível o fundo/moldura já preparados no CSS até a cliente
 * enviar os arquivos definitivos. O <img> do lightbox é reaproveitado
 * para várias fotos, então também remove a classe quando uma imagem
 * carrega com sucesso (importante assim que as fotos reais entrarem).
 */
function inicializarFallbackImagens() {
  const imagensPlaceholder = document.querySelectorAll(
    '.cabecalho__logo-img, .rodape__logo, .hero__foto, .sobre__foto, .consultorio__foto, .lightbox__foto, .instagram__foto'
  );

  imagensPlaceholder.forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('imagem-indisponivel');
    });
    img.addEventListener('load', () => {
      img.classList.remove('imagem-indisponivel');
    });

    // O carregamento da imagem começa assim que o HTML é interpretado,
    // ou seja, pode terminar (e falhar) antes deste script rodar no
    // DOMContentLoaded — sem esta checagem, o evento "error" já disparado
    // passaria despercebido e o ícone de imagem quebrada ficaria visível.
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      img.classList.add('imagem-indisponivel');
    }
  });
}

/**
 * Adiciona a classe .scrolled ao header quando a página é rolada, e mantém
 * a variável --altura-header sincronizada com a altura real do header
 * (usada no scroll-padding-top e no padding-top do <main>).
 */
function inicializarHeaderScroll() {
  const cabecalho = document.getElementById('cabecalho');
  if (!cabecalho) return;

  const LIMITE_SCROLL = 10;

  const atualizarAlturaHeader = () => {
    document.documentElement.style.setProperty('--altura-header', `${cabecalho.offsetHeight}px`);
  };

  const atualizarSombra = () => {
    cabecalho.classList.toggle('scrolled', window.scrollY > LIMITE_SCROLL);
  };

  atualizarAlturaHeader();
  atualizarSombra();

  window.addEventListener('scroll', atualizarSombra, { passive: true });
  window.addEventListener('resize', atualizarAlturaHeader);

  if (window.ResizeObserver) {
    new ResizeObserver(atualizarAlturaHeader).observe(cabecalho);
  }
}

/**
 * Controla o menu mobile (drawer): abrir/fechar pelo hambúrguer, overlay,
 * tecla Esc, clique em qualquer link ou Tab saindo dos limites do drawer
 * (focus trap). Trava o scroll do body compensando a posição de rolagem
 * (para a página não pular ao fechar) e devolve o foco ao botão hambúrguer
 * ao fechar.
 */
function inicializarMenuMobile() {
  const botaoMenu = document.getElementById('botao-menu');
  const nav = document.getElementById('nav-principal');
  const overlay = document.getElementById('menu-overlay');

  if (!botaoMenu || !nav || !overlay) return;

  let scrollYAoAbrir = 0;

  const travarScroll = () => {
    scrollYAoAbrir = window.scrollY;
    document.body.style.top = `-${scrollYAoAbrir}px`;
    document.body.classList.add('menu-aberto');
  };

  const destravarScroll = () => {
    document.body.classList.remove('menu-aberto');
    document.body.style.top = '';
    window.scrollTo(0, scrollYAoAbrir);
  };

  const abrirMenu = () => {
    nav.classList.add('aberto');
    overlay.classList.add('ativo');
    botaoMenu.setAttribute('aria-expanded', 'true');
    botaoMenu.setAttribute('aria-label', 'Fechar menu de navegação');
    travarScroll();

    const primeiroLink = nav.querySelector('a');
    if (primeiroLink) primeiroLink.focus();
  };

  const fecharMenu = () => {
    nav.classList.remove('aberto');
    overlay.classList.remove('ativo');
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu de navegação');
    destravarScroll();
    botaoMenu.focus();
  };

  botaoMenu.addEventListener('click', () => {
    const estaAberto = botaoMenu.getAttribute('aria-expanded') === 'true';
    estaAberto ? fecharMenu() : abrirMenu();
  });

  overlay.addEventListener('click', fecharMenu);

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', fecharMenu);
  });

  document.addEventListener('keydown', (evento) => {
    if (botaoMenu.getAttribute('aria-expanded') !== 'true') return;

    if (evento.key === 'Escape') {
      fecharMenu();
      return;
    }

    // Focus trap simples: Tab no último link volta ao primeiro, e
    // Shift+Tab no primeiro vai para o último, sem deixar o foco escapar
    // para o conteúdo por trás do drawer.
    if (evento.key === 'Tab') {
      const links = Array.from(nav.querySelectorAll('a'));
      if (links.length === 0) return;
      const primeiro = links[0];
      const ultimo = links[links.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
  });
}

/**
 * Destaca no menu o link correspondente à seção visível no momento (scroll spy).
 * Ignora silenciosamente seções que ainda não existem no HTML.
 */
function inicializarScrollSpy() {
  const links = Array.from(document.querySelectorAll('.cabecalho__link'));
  const cabecalho = document.getElementById('cabecalho');
  const alturaHeader = cabecalho ? cabecalho.offsetHeight : 96;

  const mapaSecoes = links
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      const secao = id ? document.getElementById(id) : null;
      return secao ? { link, secao } : null;
    })
    .filter(Boolean);

  if (mapaSecoes.length === 0) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const correspondente = mapaSecoes.find((item) => item.secao === entrada.target);
        if (!correspondente) return;

        links.forEach((link) => link.classList.remove('ativo'));
        correspondente.link.classList.add('ativo');
      });
    },
    { rootMargin: `-${alturaHeader + 10}px 0px -60% 0px`, threshold: 0 }
  );

  mapaSecoes.forEach(({ secao }) => observador.observe(secao));
}

/**
 * Revela com fade + slide os elementos .reveal conforme entram na tela.
 * Reutilizável por qualquer seção — basta adicionar a classe "reveal".
 * O atraso escalonado entre itens de uma mesma grade é feito via CSS
 * (transition-delay por seletor, ex.: .identificacao__grid .reveal:nth-child).
 */
function inicializarAnimacaoEntrada() {
  const elementos = document.querySelectorAll('.reveal');
  if (elementos.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    elementos.forEach((elemento) => elemento.classList.add('reveal--visivel'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('reveal--visivel');
        obs.unobserve(entrada.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  elementos.forEach((elemento) => observador.observe(elemento));
}

/**
 * Carrossel do consultório: foto central em destaque, com as vizinhas
 * visíveis pela metade nas laterais (efeito "coverflow"). Navega por
 * setas, swipe no toque e teclado (setas do teclado com o carrossel
 * focado), com bullets indicando a posição e loop infinito. Clicar na
 * foto central abre o lightbox (mesma navegação, agora entre todas as
 * fotos); clicar numa foto lateral parcial só traz ela para o centro.
 * Aceita de 4 a 6 fotos — o número de itens no HTML já define tudo.
 */
function inicializarCarrosselConsultorio() {
  const carrossel = document.getElementById('carrossel-consultorio');
  const trilha = document.getElementById('consultorio-trilha');
  const lightbox = document.getElementById('lightbox');

  if (!carrossel || !trilha || !lightbox) return;

  const itens = Array.from(trilha.querySelectorAll('.consultorio__item'));
  const botaoAnteriorCarrossel = document.getElementById('consultorio-seta-anterior');
  const botaoProximoCarrossel = document.getElementById('consultorio-seta-proxima');
  const containerBullets = document.getElementById('consultorio-bullets');

  const fotoLightbox = document.getElementById('lightbox-foto');
  const botaoAnteriorLightbox = document.getElementById('lightbox-anterior');
  const botaoProximoLightbox = document.getElementById('lightbox-proximo');

  if (
    itens.length === 0 ||
    !botaoAnteriorCarrossel || !botaoProximoCarrossel || !containerBullets ||
    !fotoLightbox || !botaoAnteriorLightbox || !botaoProximoLightbox
  ) return;

  const fotos = itens.map((item) => {
    const img = item.querySelector('img');
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt'), legenda: item.dataset.legenda };
  });

  const total = fotos.length;
  let indiceCarrossel = 0;

  // --- Carrossel ---

  const bullets = fotos.map((foto, indice) => {
    const bullet = document.createElement('button');
    bullet.type = 'button';
    bullet.className = 'consultorio__bullet';
    bullet.setAttribute('aria-label', `Foto ${indice + 1} de ${total}: ${foto.legenda}`);
    bullet.addEventListener('click', () => irParaIndice(indice));
    containerBullets.appendChild(bullet);
    return bullet;
  });

  function atualizarCarrossel() {
    itens.forEach((item, indice) => {
      // Distância circular até o índice atual: 0 = central, 1 = próxima
      // (direita), total-1 = anterior (esquerda), o resto fica oculto.
      const distancia = (indice - indiceCarrossel + total) % total;
      let estado = 'oculto';
      if (distancia === 0) estado = 'ativo';
      else if (distancia === 1) estado = 'proxima';
      else if (distancia === total - 1) estado = 'anterior';
      item.dataset.estado = estado;
      item.setAttribute('aria-hidden', estado === 'ativo' ? 'false' : 'true');
      item.tabIndex = estado === 'ativo' ? 0 : -1;
    });

    bullets.forEach((bullet, indice) => {
      bullet.setAttribute('aria-current', String(indice === indiceCarrossel));
    });
  }

  function irParaIndice(indice) {
    indiceCarrossel = ((indice % total) + total) % total;
    atualizarCarrossel();
  }

  function irParaAnteriorCarrossel() {
    irParaIndice(indiceCarrossel - 1);
  }

  function irParaProximaCarrossel() {
    irParaIndice(indiceCarrossel + 1);
  }

  botaoAnteriorCarrossel.addEventListener('click', irParaAnteriorCarrossel);
  botaoProximoCarrossel.addEventListener('click', irParaProximaCarrossel);

  itens.forEach((item, indice) => {
    item.addEventListener('click', () => {
      const distancia = (indice - indiceCarrossel + total) % total;
      if (distancia === 0) {
        abrirLightbox(indice, item);
      } else {
        irParaIndice(indice);
      }
    });
  });

  carrossel.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      irParaAnteriorCarrossel();
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      irParaProximaCarrossel();
    }
  });

  // Swipe no toque: só decide a direção quando o arrasto horizontal supera
  // um limiar mínimo, evitando trocar de foto sem querer durante o scroll
  // vertical da página.
  const LIMIAR_SWIPE = 40;
  let inicioX = null;
  let inicioY = null;

  trilha.addEventListener('touchstart', (evento) => {
    inicioX = evento.touches[0].clientX;
    inicioY = evento.touches[0].clientY;
  }, { passive: true });

  trilha.addEventListener('touchend', (evento) => {
    if (inicioX === null) return;
    const deltaX = evento.changedTouches[0].clientX - inicioX;
    const deltaY = evento.changedTouches[0].clientY - inicioY;
    inicioX = null;
    inicioY = null;

    if (Math.abs(deltaX) < LIMIAR_SWIPE || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX < 0) irParaProximaCarrossel();
    else irParaAnteriorCarrossel();
  });

  atualizarCarrossel();

  // --- Lightbox (mesmas fotos, navegação independente do carrossel) ---

  let indiceLightbox = 0;
  let elementoOrigem = null;

  const atualizarFotoExibida = () => {
    const foto = fotos[indiceLightbox];
    fotoLightbox.src = foto.src;
    fotoLightbox.alt = foto.alt;
  };

  const abrirLightbox = (indice, origem) => {
    indiceLightbox = indice;
    elementoOrigem = origem;
    atualizarFotoExibida();
    lightbox.classList.add('lightbox--aberto');
    document.body.classList.add('lightbox-aberto');
  };

  const fecharLightbox = () => {
    lightbox.classList.remove('lightbox--aberto');
    document.body.classList.remove('lightbox-aberto');
    if (elementoOrigem) elementoOrigem.focus();
  };

  const irParaAnteriorLightbox = () => {
    indiceLightbox = (indiceLightbox - 1 + total) % total;
    atualizarFotoExibida();
  };

  const irParaProximaLightbox = () => {
    indiceLightbox = (indiceLightbox + 1) % total;
    atualizarFotoExibida();
  };

  lightbox.querySelectorAll('[data-lightbox-fechar]').forEach((elemento) => {
    elemento.addEventListener('click', fecharLightbox);
  });

  botaoAnteriorLightbox.addEventListener('click', irParaAnteriorLightbox);
  botaoProximoLightbox.addEventListener('click', irParaProximaLightbox);

  document.addEventListener('keydown', (evento) => {
    if (!lightbox.classList.contains('lightbox--aberto')) return;

    if (evento.key === 'Escape') fecharLightbox();
    if (evento.key === 'ArrowLeft') irParaAnteriorLightbox();
    if (evento.key === 'ArrowRight') irParaProximaLightbox();
  });
}

/**
 * Accordion do FAQ: apenas um item aberto por vez, com aria-expanded
 * sincronizado e navegação por teclado (setas, Home, End) entre as
 * perguntas, conforme o padrão de acessibilidade para accordions.
 */
function inicializarFAQ() {
  const itens = Array.from(document.querySelectorAll('.faq__item'));
  if (itens.length === 0) return;

  const botoes = itens.map((item) => item.querySelector('.faq__pergunta'));

  const fecharItem = (item) => {
    item.classList.remove('aberto');
    item.querySelector('.faq__pergunta').setAttribute('aria-expanded', 'false');
  };

  const abrirItem = (item) => {
    itens.forEach((outro) => {
      if (outro !== item) fecharItem(outro);
    });
    item.classList.add('aberto');
    item.querySelector('.faq__pergunta').setAttribute('aria-expanded', 'true');
  };

  itens.forEach((item, indice) => {
    const botao = botoes[indice];

    botao.addEventListener('click', () => {
      const estaAberto = item.classList.contains('aberto');
      estaAberto ? fecharItem(item) : abrirItem(item);
    });

    botao.addEventListener('keydown', (evento) => {
      let indiceAlvo = null;

      if (evento.key === 'ArrowDown') indiceAlvo = (indice + 1) % botoes.length;
      if (evento.key === 'ArrowUp') indiceAlvo = (indice - 1 + botoes.length) % botoes.length;
      if (evento.key === 'Home') indiceAlvo = 0;
      if (evento.key === 'End') indiceAlvo = botoes.length - 1;

      if (indiceAlvo !== null) {
        evento.preventDefault();
        botoes[indiceAlvo].focus();
      }
    });
  });
}

/**
 * Formata dígitos como telefone brasileiro: (00) 0000-0000 (10 dígitos,
 * fixo/celular antigo) ou (00) 00000-0000 (11 dígitos, celular com 9).
 * @param {string} valor - Valor bruto digitado no campo.
 * @returns {string} Telefone formatado conforme a quantidade de dígitos.
 */
function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/**
 * Formulário de contato: aplica a máscara de telefone em tempo real,
 * valida nome/telefone/tipo de atendimento no submit (com aria-invalid,
 * mensagem de erro por campo e foco no primeiro campo inválido) e, se
 * tudo estiver certo, monta a mensagem e abre o WhatsApp em nova aba
 * (não há backend — o próprio WhatsApp é o canal de envio).
 */
function inicializarFormularioContato() {
  const form = document.getElementById('formulario-contato');
  if (!form) return;

  const campoNome = document.getElementById('campo-nome');
  const campoTelefone = document.getElementById('campo-telefone');
  const campoTipo = document.getElementById('campo-tipo');
  const campoMensagem = document.getElementById('campo-mensagem');
  const feedback = document.getElementById('contato-feedback');

  const erroNome = document.getElementById('erro-nome');
  const erroTelefone = document.getElementById('erro-telefone');
  const erroTipo = document.getElementById('erro-tipo');

  campoTelefone.addEventListener('input', () => {
    campoTelefone.value = formatarTelefone(campoTelefone.value);
  });

  const marcarErro = (campo, elementoErro, mensagem) => {
    campo.setAttribute('aria-invalid', 'true');
    elementoErro.textContent = mensagem;
  };

  const limparErro = (campo, elementoErro) => {
    campo.removeAttribute('aria-invalid');
    elementoErro.textContent = '';
  };

  [
    [campoNome, erroNome],
    [campoTelefone, erroTelefone],
    [campoTipo, erroTipo],
  ].forEach(([campo, elementoErro]) => {
    campo.addEventListener('input', () => limparErro(campo, elementoErro));
    campo.addEventListener('change', () => limparErro(campo, elementoErro));
  });

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const telefoneDigitos = campoTelefone.value.replace(/\D/g, '');
    const tipo = campoTipo.value;
    const mensagem = campoMensagem.value.trim();

    let primeiroCampoInvalido = null;

    if (nome.length < 3) {
      marcarErro(campoNome, erroNome, 'Digite seu nome completo (mínimo 3 caracteres).');
      primeiroCampoInvalido = primeiroCampoInvalido || campoNome;
    } else {
      limparErro(campoNome, erroNome);
    }

    if (telefoneDigitos.length !== 10 && telefoneDigitos.length !== 11) {
      marcarErro(campoTelefone, erroTelefone, 'Informe um telefone válido, com DDD (10 ou 11 dígitos).');
      primeiroCampoInvalido = primeiroCampoInvalido || campoTelefone;
    } else {
      limparErro(campoTelefone, erroTelefone);
    }

    if (!tipo) {
      marcarErro(campoTipo, erroTipo, 'Selecione o tipo de atendimento.');
      primeiroCampoInvalido = primeiroCampoInvalido || campoTipo;
    } else {
      limparErro(campoTipo, erroTipo);
    }

    if (primeiroCampoInvalido) {
      feedback.textContent = '';
      feedback.removeAttribute('data-tipo');
      primeiroCampoInvalido.focus();
      return;
    }

    const telefoneFormatado = campoTelefone.value;
    let mensagemWhatsApp = `Olá, Yasmim! Meu nome é ${nome}. Gostaria de agendar um atendimento ${tipo}.`;
    if (mensagem) mensagemWhatsApp += ` ${mensagem}`;
    mensagemWhatsApp += ` Meu contato: ${telefoneFormatado}`;

    registrarEventoGTM('envio_formulario_contato', { tipo_atendimento: tipo });
    window.open(linkWhatsApp(mensagemWhatsApp), '_blank', 'noopener');

    feedback.textContent = 'Tudo certo! Abrimos o WhatsApp para você concluir o envio.';
    feedback.setAttribute('data-tipo', 'sucesso');
    form.reset();
  });
}

/**
 * Botão flutuante de WhatsApp: aparece com fade após 300px de rolagem e
 * some temporariamente quando o botão de enviar do formulário de contato
 * está visível, para nunca sobrepor a área de toque dele no mobile.
 */
function inicializarBotaoFlutuante() {
  const botao = document.getElementById('botao-whatsapp-flutuante');
  if (!botao) return;

  const LIMITE_SCROLL = 300;

  const atualizarVisibilidade = () => {
    botao.classList.toggle('visivel', window.scrollY > LIMITE_SCROLL);
  };

  atualizarVisibilidade();
  window.addEventListener('scroll', atualizarVisibilidade, { passive: true });

  const botaoFormulario = document.querySelector('.contato__botao');
  if (botaoFormulario && 'IntersectionObserver' in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          botao.classList.toggle('botao-flutuante--oculto', entrada.isIntersecting);
        });
      },
      { rootMargin: '0px 0px -56px 0px' }
    );
    observador.observe(botaoFormulario);
  }
}

/**
 * Preenche o ano atual na barra inferior do rodapé.
 */
function inicializarAnoRodape() {
  const elementoAno = document.getElementById('ano-atual');
  if (!elementoAno) return;
  elementoAno.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarLinksWhatsApp();
  inicializarFallbackImagens();
  inicializarHeaderScroll();
  inicializarMenuMobile();
  inicializarScrollSpy();
  inicializarAnimacaoEntrada();
  inicializarCarrosselConsultorio();
  inicializarFAQ();
  inicializarFormularioContato();
  inicializarBotaoFlutuante();
  inicializarAnoRodape();
});
