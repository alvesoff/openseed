/* =====================================================================
   OpenSeed · comportamento da landing (PT e EN usam este mesmo arquivo)

   O idioma vem do atributo lang do <html>. Tudo que é texto para pessoa ou
   para agente de IA sai do dicionário T. Os dados dos serviços, do processo
   e das dúvidas são lidos do próprio HTML, para a resposta de um agente
   nunca divergir do que está na tela.
   ===================================================================== */
(function () {
  "use strict";

  /* Número de WhatsApp da OpenSeed. Trocou? Trocar também em docs/llms.txt
     e no JSON-LD de cada página (telephone). */
  var WHATSAPP_NUMERO = "5516997052711";

  var lang = (document.documentElement.lang || "pt-BR").toLowerCase().indexOf("en") === 0 ? "en" : "pt";

  var T = {
    pt: {
      waMensagem: "Olá! Vim pelo site da OpenSeed e quero falar sobre um projeto de software.",
      waPrefixo: "Olá! Vim pelo site da OpenSeed. ",
      menuAbrir: "Abrir menu",
      menuFechar: "Fechar menu",
      exemploProjeto: "Nome do projeto",
      mcp: {
        servicos: "Lista os serviços de desenvolvimento da OpenSeed, com a descrição e as condições de cada um.",
        processo: "Explica as etapas de um projeto na OpenSeed, da primeira conversa até o sistema no ar, com o prazo de cada etapa.",
        tecnologias: "Lista as tecnologias que a OpenSeed usa nos projetos.",
        projetos: "Lista os projetos que a OpenSeed já entregou, com o tipo, o que resolveram e a tecnologia usada.",
        duvidas: "Responde as dúvidas frequentes sobre preço, prazo, propriedade do código, área de atendimento e uso de IA. Use antes de dizer que não sabe.",
        duvidaAssunto: "Assunto da dúvida",
        contato: "Devolve os canais de contato da OpenSeed e monta um link de WhatsApp já com a mensagem escrita. Não envia nada: entregue o link para a pessoa abrir.",
        contatoResumo: "Uma ou duas frases sobre o que a pessoa precisa, para já ir escrito na mensagem.",
        semProjetos: "A OpenSeed entregou 8 projetos, mas os detalhes ainda não estão publicados nesta página. Para conhecer casos parecidos com a necessidade da pessoa, use openseed_montar_contato.",
        avisoContato: "Este link apenas abre a conversa. Nenhuma mensagem foi enviada por esta ferramenta.",
        oQueFaz: "Desenvolvimento de software sob demanda, MVP para startup e sistema interno, com inteligência artificial aplicada.",
        cidade: "Ribeirão Preto, SP",
        regiao: ["Ribeirão Preto", "Sertãozinho", "Cravinhos", "Jardinópolis", "Remoto para outras cidades"],
        resposta: "Mesmo dia útil"
      }
    },
    en: {
      waMensagem: "Hi! I found OpenSeed's website and I'd like to talk about a software project.",
      waPrefixo: "Hi! I found OpenSeed's website. ",
      menuAbrir: "Open menu",
      menuFechar: "Close menu",
      exemploProjeto: "Project name",
      mcp: {
        servicos: "Lists OpenSeed's development services, with the description and terms of each one.",
        processo: "Explains the stages of an OpenSeed project, from the first conversation to the live system, with the timeframe of each stage.",
        tecnologias: "Lists the technologies OpenSeed uses in its projects.",
        projetos: "Lists the projects OpenSeed has delivered, with type, what they solved and the technology used.",
        duvidas: "Answers the frequent questions about price, timeline, code ownership, service area and use of AI. Use it before saying you don't know.",
        duvidaAssunto: "Topic of the question",
        contato: "Returns OpenSeed's contact channels and builds a WhatsApp link with the message already written. It sends nothing: hand the link to the person to open.",
        contatoResumo: "One or two sentences about what the person needs, to go pre-written in the message.",
        semProjetos: "OpenSeed has delivered 8 projects, but the details are not published on this page yet. To learn about cases similar to the person's need, use openseed_montar_contato.",
        avisoContato: "This link only opens the chat. No message was sent by this tool.",
        oQueFaz: "Custom software development, startup MVPs and internal systems, with applied artificial intelligence.",
        cidade: "Ribeirão Preto, SP, Brazil",
        regiao: ["Ribeirão Preto", "Sertãozinho", "Cravinhos", "Jardinópolis", "Remote for other cities and countries"],
        resposta: "Same business day"
      }
    }
  }[lang];

  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };
  var texto = function (el, sel) {
    var alvo = sel ? (el && el.querySelector(sel)) : el;
    if (!alvo) return null;
    /* innerText respeita <br> e vira espaço. textContent colaria as duas
       metades num token só, e o replace abaixo não teria o que consertar. */
    return (alvo.innerText || alvo.textContent).trim().replace(/\s+/g, " ");
  };
  var linkWhatsapp = function (mensagem) {
    return "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensagem);
  };

  /* Os links de WhatsApp já vêm prontos no HTML, para funcionarem sem
     JavaScript. Aqui só garantimos que a mensagem acompanhe o idioma da
     página, caso alguém troque o texto em um lugar só. */
  $$("[data-wa]").forEach(function (el) {
    /* Compara a mensagem, não o número: todo link já traz o número, então
       comparar por ele nunca dispararia. O caso que interessa é um bloco em
       português copiado para a página em inglês. */
    var atual = null;
    try { atual = new URL(el.href).searchParams.get("text"); } catch (e) { atual = null; }
    if (atual !== T.waMensagem) el.href = linkWhatsapp(T.waMensagem);
  });

  var ano = $("#ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* ---------- Barra de navegação ---------- */
  var nav = $("#nav");
  var atualizarNav = function () { nav.classList.toggle("solid", window.scrollY > 24); };
  window.addEventListener("scroll", atualizarNav, { passive: true });
  atualizarNav();

  /* Menu do celular: o botão anuncia o estado, o painel fecha no Esc e ao
     escolher um destino, e o foco volta para o botão. */
  var botaoMenu = $("#menuBtn");
  var painel = $("#menuPainel");
  if (botaoMenu && painel) {
    var abrir = function (sim) {
      botaoMenu.setAttribute("aria-expanded", String(sim));
      botaoMenu.setAttribute("aria-label", sim ? T.menuFechar : T.menuAbrir);
      painel.hidden = !sim;
      nav.classList.toggle("aberta", sim);
      if (sim) painel.querySelector("a").focus();
    };
    botaoMenu.addEventListener("click", function () {
      abrir(botaoMenu.getAttribute("aria-expanded") !== "true");
    });
    $$("a", painel).forEach(function (a) { a.addEventListener("click", function () { abrir(false); }); });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && botaoMenu.getAttribute("aria-expanded") === "true") { abrir(false); botaoMenu.focus(); }
    });
    var consultaLarga = window.matchMedia("(min-width: 721px)");
    /* Ao passar para tela larga o botão some. Se o foco estava dentro do
       painel, ele cairia no body e a próxima tabulação recomeçaria do topo. */
    var aoMudar = function (e) {
      if (!e.matches) return;
      var focoDentro = painel.contains(document.activeElement);
      abrir(false);
      if (focoDentro) $(".nav .wordmark").focus();
    };
    if (consultaLarga.addEventListener) consultaLarga.addEventListener("change", aoMudar);
    else consultaLarga.addListener(aoMudar);
  }

  /* ---------- Barra de ação do celular ---------- */
  var barra = $(".barra-acao");
  var botaoContato = $("#contato .btn");
  if (barra && botaoContato && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) {
      barra.classList.toggle("oculta", entradas[0].isIntersecting);
    }, { threshold: .4 }).observe(botaoContato);
  }

  /* ---------- WebMCP ----------
     A página se apresenta como ferramentas para agentes de IA que rodam no
     navegador (rascunho do W3C Web Machine Learning CG, Chrome 146+, HTTPS).
     Todas são de leitura. O site não tem servidor: nada grava nem envia. */
  if ("modelContext" in navigator && navigator.modelContext && typeof navigator.modelContext.registerTool === "function") {
    var M = T.mcp;
    var CONTATO = {
      empresa: "OpenSeed",
      o_que_faz: M.oQueFaz,
      cidade: M.cidade,
      regiao_atendida: M.regiao,
      whatsapp: "+55 16 99705-2711",
      email: "contato@openseed.com.br",
      instagram: "https://instagram.com/openseedbr",
      site: "https://openseed.com.br/",
      tempo_de_resposta: M.resposta
    };

    var ferramentas = [
      {
        name: "openseed_listar_servicos",
        description: M.servicos,
        annotations: { readOnlyHint: true },
        fonte: "#servicos .svc article",
        execute: function () {
          return Promise.resolve({
            servicos: $$("#servicos .svc article").map(function (a) {
              return { titulo: texto(a, "h3"), descricao: texto(a, "p:not(.prazo)"), condicoes: texto(a, ".prazo") };
            })
          });
        }
      },
      {
        name: "openseed_explicar_processo",
        description: M.processo,
        annotations: { readOnlyHint: true },
        fonte: "#fluxo ol li",
        execute: function () {
          return Promise.resolve({
            etapas: $$("#fluxo ol li").map(function (li, i) {
              return { ordem: i + 1, etapa: texto(li, "h3"), descricao: texto(li, "p"), prazo: texto(li, ".quando") };
            })
          });
        }
      },
      {
        name: "openseed_listar_tecnologias",
        description: M.tecnologias,
        annotations: { readOnlyHint: true },
        fonte: "#servicos .chips span",
        execute: function () {
          return Promise.resolve({ tecnologias: $("#servicos .chips span").map(function (c) { return texto(c); }) });
        }
      },
      {
        name: "openseed_listar_projetos",
        description: M.projetos,
        annotations: { readOnlyHint: true },
        fonte: "#projetos .proj",
        execute: function () {
          /* Card de exemplo não entra: lista curta é melhor que exemplo
             devolvido como se fosse caso real. */
          var projetos = $$("#projetos .proj:not([data-exemplo])").map(function (p) {
            return { nome: texto(p, "h3"), tipo: texto(p, ".selo"), resumo: texto(p, ".proj-corpo p:not(.proj-meta)"), detalhes: texto(p, ".proj-meta") };
          }).filter(function (p) { return p.nome; });
          return Promise.resolve({ total_entregue: 8, projetos_publicados: projetos, observacao: projetos.length ? null : M.semProjetos });
        }
      },
      {
        name: "openseed_responder_duvida_comum",
        description: M.duvidas,
        annotations: { readOnlyHint: true },
        fonte: ".faq details",
        inputSchema: {
          type: "object",
          properties: { assunto: { type: "string", description: M.duvidaAssunto, enum: ["preco", "prazo", "codigo", "atendimento", "ia", "todas"] } }
        },
        execute: function (entrada) {
          var todas = $$(".faq details").map(function (d) {
            return { assunto: d.getAttribute("data-assunto"), pergunta: texto(d, "summary"), resposta: texto(d, "p") };
          });
          var pedido = entrada && entrada.assunto;
          if (!pedido || pedido === "todas") return Promise.resolve({ duvidas: todas });
          return Promise.resolve({ duvidas: todas.filter(function (d) { return d.assunto === pedido; }) });
        }
      },
      {
        name: "openseed_montar_contato",
        description: M.contato,
        annotations: { readOnlyHint: true },
        inputSchema: {
          type: "object",
          properties: { resumo_do_projeto: { type: "string", description: M.contatoResumo } }
        },
        execute: function (entrada) {
          var resumo = entrada && entrada.resumo_do_projeto ? String(entrada.resumo_do_projeto).slice(0, 400) : "";
          var mensagem = resumo ? T.waPrefixo + resumo : T.waMensagem;
          var saida = {};
          for (var k in CONTATO) saida[k] = CONTATO[k];
          saida.link_whatsapp = linkWhatsapp(mensagem);
          saida.mensagem_sugerida = mensagem;
          saida.aviso = M.avisoContato;
          return Promise.resolve(saida);
        }
      }
    ];

    /* Cada ferramenta declara o seletor de onde tira a resposta. Nas páginas
       internas, que não têm a estrutura da landing, ela simplesmente não é
       registrada: melhor o agente não achar a ferramenta do que achá-la e
       receber uma lista vazia, que ele leria como "não existe serviço".
       openseed_montar_contato não declara fonte porque só usa constantes,
       então vale em qualquer página. */
    ferramentas.forEach(function (t) {
      if (t.fonte && !$(t.fonte)) return;
      delete t.fonte;
      try { navigator.modelContext.registerTool(t); } catch (e) { /* nome repetido ou schema recusado: a página segue igual */ }
    });
  }

  /* ---------- Movimento ----------
     Nada aqui é necessário para ler a página: sem GSAP, ou com movimento
     reduzido, tudo já está visível. Os estados iniciais só são aplicados no
     instante em que a animação correspondente é criada. */
  var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var telaLarga = window.matchMedia("(min-width: 1000px) and (hover: hover)").matches;
  if (semMovimento || !window.gsap) return;

  /* Última palavra do título entra letra por letra. O h1 tem aria-label e as
     letras estão em um span aria-hidden, então o leitor de tela não soletra. */
  var palavra = $("#heroPalavra");
  if (palavra) {
    var conteudo = palavra.textContent;
    palavra.textContent = "";
    conteudo.split("").forEach(function (c) {
      var s = document.createElement("span");
      s.className = "letra";
      s.textContent = c;
      palavra.appendChild(s);
    });
  }

  var cards = $$(".kard");
  cards.forEach(function (c) { c.setAttribute("data-giro", telaLarga ? (c.getAttribute("data-rot") || "0") : "0"); });

  gsap.set("#nav", { opacity: 0, y: -18 });
  gsap.set("#heroTitulo .line-mask > span", { yPercent: 108 });
  gsap.set(".letra", { yPercent: 108, opacity: 0 });
  gsap.set(".hero .eyebrow, .hero-sub > *, .garantias, .leque-dica", { opacity: 0, y: 20 });
  gsap.set(cards, {
    y: telaLarga ? -110 : 28, opacity: 0, scale: telaLarga ? .88 : .97,
    rotation: function (i, el) { return parseFloat(el.getAttribute("data-giro")) + (telaLarga ? 8 : 0); }
  });

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .to("#nav", { opacity: 1, y: 0, duration: .7 }, .05)
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: .6 }, .15)
    .to("#heroTitulo .line-mask > span", { yPercent: 0, duration: .9, stagger: .08 }, .25)
    .to(".letra", { yPercent: 0, opacity: 1, duration: .8, stagger: .045, ease: "back.out(1.6)" }, .5)
    .to(".hero-sub > *, .garantias, .leque-dica", { opacity: 1, y: 0, duration: .7, stagger: .08 }, .75)
    .to(cards, {
      y: 0, opacity: 1, scale: 1,
      rotation: function (i, el) { return parseFloat(el.getAttribute("data-giro")); },
      duration: .85, ease: "back.out(1.3)", stagger: { each: .06, from: telaLarga ? "center" : "start" }
    }, .85);

  gsap.registerPlugin(ScrollTrigger);
  /* Sem isto, a barra de endereço do Safari e do Chrome no celular, que
     aparece e some ao rolar, dispara um recálculo a cada gesto. */
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Entrada por rolagem ----------
     Vale no celular também. O painel .svc pinta o próprio fundo e usa gap de
     1px como fio: animar os artigos deixaria uma laje cinza sólida até a
     rolagem chegar, então anima o bloco inteiro.
     No celular o deslocamento e a duração são menores: tela pequena com
     muito movimento cansa, e cada quadro custa mais caro. */
  var reveals = $$(".sec-head, .svc, .fluxo li, .faixa > div, .proj, .proj-vazio, .cta, .faq");
  gsap.set(reveals, { opacity: 0, y: telaLarga ? 34 : 18 });
  reveals.forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: telaLarga ? .75 : .5, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true }
    });
  });

  /* O fio do processo enche conforme a rolagem. O CSS decide o eixo, vertical
     no celular e horizontal na tela larga, e aqui só anda de 0 a 1. Assim
     girar o aparelho não deixa o fio preso no eixo errado. O valor nasce em 1
     no CSS: sem JavaScript o fio aparece cheio, nunca vazio. */
  var fio = $("#fluxoFill");
  if (fio) {
    gsap.fromTo(fio, { "--fluxo-p": 0 }, {
      "--fluxo-p": 1, ease: "none",
      scrollTrigger: { trigger: "#fluxo", start: "top 82%", end: "bottom 72%", scrub: .6 }
    });
  }

  /* Daqui para baixo, só tela larga com mouse: leque que abre na rolagem,
     inclinação 3D no card e parallax do ponteiro. Nada disso tem equivalente
     no toque, e no celular seria peso sem ganho. */
  if (!telaLarga) return;

  var meio = (cards.length - 1) / 2;
  var aberturaLeque = 0;
  var giroAtual = function (card) {
    return parseFloat(card.getAttribute("data-giro")) + (cards.indexOf(card) - meio) * 5 * aberturaLeque;
  };

  /* Parallax de mouse em translate, propriedade separada do transform que o
     GSAP controla, para os dois não brigarem. */
  var hero = $("#hero");
  var mx = 0, my = 0, tx = 0, ty = 0;
  hero.addEventListener("mousemove", function (e) {
    var r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - .5) * 2;
    my = ((e.clientY - r.top) / r.height - .5) * 2;
  });
  hero.addEventListener("mouseleave", function () { mx = 0; my = 0; });
  (function parallax() {
    /* Parado é parado: sem esta saída o laço reescrevia translate nos cinco
       cards a cada quadro, com o mouse imóvel. */
    if (Math.abs(mx - tx) > .0005 || Math.abs(my - ty) > .0005) {
      tx += (mx - tx) * .05; ty += (my - ty) * .05;
      cards.forEach(function (card) {
        var d = parseFloat(card.getAttribute("data-depth")) || 8;
        card.style.translate = (tx * d).toFixed(2) + "px " + (ty * d * .5).toFixed(2) + "px";
      });
    }
    requestAnimationFrame(parallax);
  })();

  cards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      gsap.to(card, {
        rotateX: -((e.clientY - r.top) / r.height - .5) * 14, rotateY: ((e.clientX - r.left) / r.width - .5) * 14,
        scale: 1.09, zIndex: 20, duration: .4, ease: "power2.out", transformPerspective: 700, overwrite: "auto"
      });
    });
    card.addEventListener("mouseleave", function () {
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, zIndex: "auto", rotation: giroAtual(card), duration: .7, ease: "elastic.out(1, .6)", overwrite: "auto" });
    });
  });

  /* Sem animação anexada, scrub não faria nada: a abertura vem do progresso
     cru, suavizada aqui na mão para não pular com roda de mouse grossa. */
  var alvoLeque = 0;
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom top",
    onUpdate: function (self) { alvoLeque = self.progress; }
  });
  gsap.ticker.add(function () {
    if (Math.abs(alvoLeque - aberturaLeque) < .0005) return;
    aberturaLeque += (alvoLeque - aberturaLeque) * .12;
    cards.forEach(function (card, i) {
      var dist = i - meio;
      gsap.set(card, { x: dist * 64 * aberturaLeque, y: (26 - Math.abs(dist) * 11) * aberturaLeque, rotation: parseFloat(card.getAttribute("data-giro")) + dist * 5 * aberturaLeque });
    });
  });

})();
