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
      waMensagem: "Olá! Vim pelo site da OpenSeed. Tenho um processo que hoje roda no braço e quero saber se dá para virar sistema.",
      waPrefixo: "Olá! Vim pelo site da OpenSeed. ",
      menuAbrir: "Abrir menu",
      menuFechar: "Fechar menu",
      exemploProjeto: "Nome do projeto",
      mcp: {
        servicos: "Lista os serviços de desenvolvimento da OpenSeed, com a descrição e as condições de cada um.",
        processo: "Explica as etapas de um projeto na OpenSeed, da primeira conversa até o sistema no ar, com o prazo de cada etapa.",
        tecnologias: "Lista as tecnologias que a OpenSeed usa nos projetos.",
        projetos: "Diz quantos sistemas a OpenSeed já entregou. Os casos ainda não estão publicados na página: para exemplos parecidos com a necessidade da pessoa, use openseed_montar_contato.",
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
      waMensagem: "Hi! I came from the OpenSeed website. I have a process that runs by hand today and I want to know if it can become a system.",
      waPrefixo: "Hi! I found OpenSeed's website. ",
      menuAbrir: "Open menu",
      menuFechar: "Close menu",
      exemploProjeto: "Project name",
      mcp: {
        servicos: "Lists OpenSeed's development services, with the description and terms of each one.",
        processo: "Explains the stages of an OpenSeed project, from the first conversation to the live system, with the timeframe of each stage.",
        tecnologias: "Lists the technologies OpenSeed uses in its projects.",
        projetos: "Reports how many systems OpenSeed has delivered. The individual cases are not published on the page yet: for examples close to the person's need, use openseed_montar_contato.",
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
     navegador (rascunho do W3C Web Machine Learning CG, só em HTTPS).
     Todas são de leitura. O site não tem servidor: nada grava nem envia.

     O getter saiu de Navigator e foi para Document no rascunho, e
     navigator.modelContext ficou como apelido a caminho da remoção. Procurar
     nos dois é o que faz a página funcionar no navegador de hoje e no de
     ontem, e custa uma linha. */
  var hospedeiro = (typeof document !== "undefined" && document.modelContext) || navigator.modelContext;
  if (hospedeiro && typeof hospedeiro.registerTool === "function") {
    var M = T.mcp;

    /* A especificação pede blocos de conteúdo, não objeto cru: um agente que
       siga o esquema atual não consegue ler { servicos: [...] } solto.
       structuredContent vai junto para o host que prefere o objeto pronto,
       e os dois carregam exatamente o mesmo dado. */
    var responder = function (dados) {
      return Promise.resolve({
        content: [{ type: "text", text: JSON.stringify(dados, null, 2) }],
        structuredContent: dados
      });
    };

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
          return responder({
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
          return responder({
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
          return responder({ tecnologias: $$("#servicos .chips span").map(function (c) { return texto(c); }) });
        }
      },
      {
        name: "openseed_listar_projetos",
        description: M.projetos,
        annotations: { readOnlyHint: true },
        fonte: "#projetos",
        execute: function () {
          /* Card de exemplo não entra: lista curta é melhor que exemplo
             devolvido como se fosse caso real. */
          var projetos = $$("#projetos .proj:not([data-exemplo])").map(function (p) {
            return { nome: texto(p, "h3"), tipo: texto(p, ".selo"), resumo: texto(p, ".proj-corpo p:not(.proj-meta)"), detalhes: texto(p, ".proj-meta") };
          }).filter(function (p) { return p.nome; });
          return responder({ total_entregue: 8, projetos_publicados: projetos, observacao: projetos.length ? null : M.semProjetos });
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
          if (!pedido || pedido === "todas") return responder({ duvidas: todas });
          return responder({ duvidas: todas.filter(function (d) { return d.assunto === pedido; }) });
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
          return responder(saida);
        }
      }
    ];

    /* Cada ferramenta declara o seletor de onde tira a resposta. Nas páginas
       internas, que não têm a estrutura da landing, ela simplesmente não é
       registrada: melhor o agente não achar a ferramenta do que achá-la e
       receber uma lista vazia, que ele leria como "não existe serviço".
       openseed_montar_contato não declara fonte porque só usa constantes,
       então vale em qualquer página. */
    /* unregisterTool saiu do rascunho e deu lugar a um AbortSignal passado no
       registro. A página é estática e nunca cancela, mas o sinal é o contrato
       de hoje e é o que um host novo espera receber. */
    var controle = typeof AbortController === "function" ? new AbortController() : null;
    ferramentas.forEach(function (t) {
      if (t.fonte && !$(t.fonte)) return;
      delete t.fonte;
      try {
        if (controle) hospedeiro.registerTool(t, { signal: controle.signal });
        else hospedeiro.registerTool(t);
      } catch (e) {
        /* Host antigo pode recusar o segundo argumento. Tenta sem ele antes
           de desistir; se recusar de novo, a página segue igual. */
        try { hospedeiro.registerTool(t); } catch (e2) { /* nada a fazer */ }
      }
    });
  }

  /* ---------- Movimento ----------
     Nada aqui é necessário para ler a página: sem GSAP, ou com movimento
     reduzido, tudo já está visível. Os estados iniciais só são aplicados no
     instante em que a animação correspondente é criada. */
  var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Este texto tem que ser igual ao da @media do leque em site.css.
     tools/conferir.js compara os dois. */
  var CONSULTA_LARGA = "(min-width: 1000px) and (hover: hover)";
  var telaLarga = window.matchMedia(CONSULTA_LARGA).matches;

  /* Estas duas listas existem também em site.css, na regra html[data-anim],
     que esconde os mesmos elementos antes da primeira pintura para o conteúdo
     não aparecer e sumir. Mexeu em uma, mexa na outra:
     tools/conferir.js compara as duas e reprova se divergirem. */
  var SEL_ENTRADA = "#nav, #heroTitulo, .hero .eyebrow, .hero-sub > *, .garantias, .leque-dica, .kard";
  var SEL_REVELA = ".sec-head, .svc, .fluxo li, .faixa > div, .proj, .proj-vazio, .cta, .faq";

  /* Tira o esconde-esconde do CSS. Chamado nos dois caminhos: quando não vai
     haver animação nenhuma, e depois que o GSAP já pôs o próprio estado
     inline, que vence o CSS. A página nunca fica escondida esperando. */
  var liberar = function () { document.documentElement.removeAttribute("data-anim"); };

  if (semMovimento || !window.gsap) { liberar(); return; }

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

  /* A opacidade sai da mesma lista que o CSS escondeu. Os deslocamentos vêm
     depois, um grupo por vez, porque cada um entra de um jeito. */
  gsap.set(SEL_ENTRADA, { opacity: 0 });
  gsap.set("#nav", { y: -18 });
  gsap.set("#heroTitulo .line-mask > span", { yPercent: 108 });
  gsap.set(".letra", { yPercent: 108, opacity: 0 });
  gsap.set(".hero .eyebrow, .hero-sub > *, .garantias, .leque-dica", { y: 20 });
  gsap.set(cards, {
    y: telaLarga ? -110 : 28, scale: telaLarga ? .88 : .97,
    rotation: function (i, el) { return parseFloat(el.getAttribute("data-giro")) + (telaLarga ? 8 : 0); }
  });

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .to("#nav", { opacity: 1, y: 0, duration: .7 }, .05)
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: .6 }, .15)
    .set("#heroTitulo", { opacity: 1 }, .25)
    .to("#heroTitulo .line-mask > span", { yPercent: 0, duration: .9, stagger: .08 }, .25)
    .to(".letra", { yPercent: 0, opacity: 1, duration: .8, stagger: .045, ease: "back.out(1.6)" }, .5)
    .to(".hero-sub > *, .garantias, .leque-dica", { opacity: 1, y: 0, duration: .7, stagger: .08 }, .75)
    .to(cards, {
      y: 0, opacity: 1, scale: 1,
      rotation: function (i, el) { return parseFloat(el.getAttribute("data-giro")); },
      duration: .85, ease: "back.out(1.3)", stagger: { each: .06, from: telaLarga ? "center" : "start" }
    }, .85);

  /* ScrollTrigger é um segundo <script>, com o próprio resumo de integridade:
     dá para o gsap chegar e ele não. Sem esta guarda a linha abaixo lançaria
     ReferenceError e nada depois dela rodaria, inclusive o liberar() que tira
     o esconde-esconde do CSS. A página ficaria em branco até o tempo limite. */
  if (!window.ScrollTrigger) { liberar(); return; }

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
  var reveals = $$(SEL_REVELA);
  gsap.set(reveals, { opacity: 0, y: telaLarga ? 34 : 18 });

  /* Deste ponto em diante o estado é do GSAP, em style inline, que vence o
     CSS. Pode soltar. */
  liberar();
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
     no toque, e no celular seria peso sem ganho.

     gsap.matchMedia monta quando a consulta passa a valer e desmonta quando
     deixa de valer, revertendo sozinho o que o GSAP pôs. Sem ele, ampliar a
     janela de 900 para 1200 deixava o CSS em modo leque e o JavaScript em modo
     carrossel, sem nada para juntar os dois até alguém recarregar a página. */
  gsap.matchMedia().add(CONSULTA_LARGA, function () {
    var meio = (cards.length - 1) / 2;
    var aberturaLeque = 0;
    var alvoLeque = 0;

    /* data-giro e data-depth são escritos uma vez e não mudam mais. Ler o
       atributo e converter para número a cada quadro, cinco vezes por laço,
       é trabalho jogado fora. */
    var giro = cards.map(function (c) { return parseFloat(c.getAttribute("data-giro")) || 0; });
    var fundo = cards.map(function (c) { return parseFloat(c.getAttribute("data-depth")) || 8; });

    /* Card com o ponteiro em cima tem a rotação controlada pelo tween de
       saída. O leque não escreve rotação nesses: gsap.set não é tween, então
       overwrite não o cancela, e ele atropelaria a volta elástica quadro a
       quadro. */
    var ocupado = cards.map(function () { return false; });

    var hero = $("#hero");
    var mx = 0, my = 0, tx = 0, ty = 0;
    var aoMoverNoHero = function (e) {
      var r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - .5) * 2;
      my = ((e.clientY - r.top) / r.height - .5) * 2;
    };
    var aoSairDoHero = function () { mx = 0; my = 0; };
    hero.addEventListener("mousemove", aoMoverNoHero);
    hero.addEventListener("mouseleave", aoSairDoHero);

    var ouvintes = cards.map(function (card, i) {
      var entrar = function (e) {
        ocupado[i] = true;
        var r = card.getBoundingClientRect();
        gsap.to(card, {
          rotateX: -((e.clientY - r.top) / r.height - .5) * 14,
          rotateY: ((e.clientX - r.left) / r.width - .5) * 14,
          scale: 1.09, zIndex: 20, duration: .4, ease: "power2.out",
          transformPerspective: 700, overwrite: "auto"
        });
      };
      var sair = function () {
        gsap.to(card, {
          rotateX: 0, rotateY: 0, scale: 1, zIndex: "auto",
          rotation: giro[i] + (i - meio) * 5 * aberturaLeque,
          duration: .7, ease: "elastic.out(1, .6)", overwrite: "auto",
          onComplete: function () { ocupado[i] = false; }
        });
      };
      card.addEventListener("mousemove", entrar);
      card.addEventListener("mouseleave", sair);
      return { card: card, entrar: entrar, sair: sair };
    });

    /* Sem animação anexada, scrub não faria nada: a abertura vem do progresso
       cru, suavizada na mão para não pular com roda de mouse grossa. */
    ScrollTrigger.create({
      trigger: ".hero", start: "top top", end: "bottom top",
      onUpdate: function (self) { alvoLeque = self.progress; }
    });

    /* Um condutor de quadros só, o do próprio GSAP, em vez de um
       requestAnimationFrame paralelo rodando a vida inteira em separado.
       Cada metade sai cedo quando não tem o que fazer. */
    var porQuadro = function () {
      if (Math.abs(mx - tx) > .0005 || Math.abs(my - ty) > .0005) {
        tx += (mx - tx) * .05;
        ty += (my - ty) * .05;
        for (var i = 0; i < cards.length; i++) {
          cards[i].style.translate = (tx * fundo[i]).toFixed(2) + "px " + (ty * fundo[i] * .5).toFixed(2) + "px";
        }
      }
      if (Math.abs(alvoLeque - aberturaLeque) < .0005) return;
      aberturaLeque += (alvoLeque - aberturaLeque) * .12;
      for (var j = 0; j < cards.length; j++) {
        var dist = j - meio;
        var estado = { x: dist * 64 * aberturaLeque, y: (26 - Math.abs(dist) * 11) * aberturaLeque };
        if (!ocupado[j]) estado.rotation = giro[j] + dist * 5 * aberturaLeque;
        gsap.set(cards[j], estado);
      }
    };
    gsap.ticker.add(porQuadro);

    /* Devolvido ao sair da consulta. O GSAP reverte os tweens e o
       ScrollTrigger criados aqui dentro; ouvinte de evento e style inline
       escrito na mão ficam por nossa conta. */
    return function () {
      gsap.ticker.remove(porQuadro);
      hero.removeEventListener("mousemove", aoMoverNoHero);
      hero.removeEventListener("mouseleave", aoSairDoHero);
      ouvintes.forEach(function (o) {
        o.card.removeEventListener("mousemove", o.entrar);
        o.card.removeEventListener("mouseleave", o.sair);
        o.card.style.translate = "";
      });
    };
  });
})();
