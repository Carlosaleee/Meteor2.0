import type { BlogPost } from '@/types/blog';

/**
 * Base de conteúdos do blog Meteor 2.0 — fonte única, versionada.
 *
 * Regras (ver plano de reformulação GEO):
 * - `metaTitle` ≤ 60 caracteres; `description` 150–160.
 * - Blocos tipados (`BlogBlock`) — nunca HTML cru.
 * - `relatedLinks.href` apenas em rotas reais do app:
 *   `/`, `/meteorologia`, `/swell`, `/noticias`, `/comercio`, `/blog`, `/creditos`
 *   (queries/âncoras válidas: `/swell?tab=forecast`, `/swell?tab=spots`, `/noticias#rodovias`).
 * - FAQ sempre com resposta escrita (PAA → bloco `answer` + JSON-LD FAQPage).
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'tabua-de-mares-ilha-comprida-cananeia',
    title: 'Tábua de Marés em Ilha Comprida e Cananéia: Guia Completo para Surf, Pesca e Coleta',
    metaTitle: 'Tábua de Marés em Ilha Comprida e Cananéia | Meteor 2.0',
    description:
      'Entenda os ciclos de maré alta e baixa em Ilha Comprida e Cananéia. Saiba a melhor maré para o surf, pesca no estuário e coleta de mariscos no Meteor 2.0.',
    summary:
      'Baixa-mar para valas e coleta, preamar para peixe grande e mar cheio no surf — e o atraso hidrográfico do estuário que a tábua oficial não conta.',
    category: 'Maré',
    categoryColor: 'bg-blue-500/20 text-blue-400',
    date: '2026-09-05',
    readTime: '9 min de leitura',
    imageUrl: '/blog/tabua-de-mares.jpg',
    imageAlt: 'Catadores de marisco em costão rochoso durante a baixa-mar no estuário do Lagamar',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'Os ciclos de maré em Ilha Comprida e Cananéia regem as condições marítimas no Litoral Sul de SP. A **maré baixa (baixa-mar)** na praia aberta favorece a formação de valas no surf e expõe os parcéis e manguezais para a coleta de marisco-da-pedra e ostra no Mar de Dentro. A **maré alta (preamar)** possibilita a entrada de grandes peixes nos canais de Cananéia e deixa o mar mais volumoso no surf. O estuário do Lagamar apresenta um **atraso hidrográfico de cerca de 1 a 2 horas** no horário do pico da maré em relação à praia de mar aberto de Ilha Comprida.',
      },
      { type: 'h2', text: 'Tabela Comparativa GEO: Maré de Sizígia vs. Maré de Quadratura' },
      {
        type: 'table',
        headers: ['Parâmetro', 'Maré de Sizígia (Lua Nova / Cheia)', 'Maré de Quadratura (Lua Crescente / Minguante)'],
        rows: [
          ['Variação de Nível', '**Amplitude Máxima:** maré muito alta e seca extrema', '**Amplitude Mínima:** pouca variação entre alta e baixa'],
          ['Impacto no Surf', 'Ondas mais fortes e correntes de retorno intensas', 'Ondas mais constantes e valas definidas no beach break'],
          ['Impacto na Pesca', 'Muita correnteza nos canais; exige chumbadas pesadas', 'Corrente suave; ideal para pesca de rodada e peixe de fundo'],
          ['Extrativismo (Ostra/Marisco)', '**Janela Perfeita:** a baixa-mar seca expõe as bancadas de pedras e raízes', 'Janela restrita; pouca exposição dos mariscos'],
          ['Navegação & Balsas', 'Atenção ao canal na maré baixa seca extrema', 'Navegação estável no Mar de Dentro sem variações abruptas'],
        ],
      },
      { type: 'h2', text: 'A Maré no Surf de Ilha Comprida (Praia Aberta)' },
      { type: 'h3', text: 'Maré Secando para Enchendo (Maré Média)' },
      {
        type: 'p',
        text:
          'É a **janela de ouro para o surfista** em praias como Boqueirão Norte, Pedrinhas e Boqueirão Sul. A água em movimento empurra a bancada de areia de forma uniforme, criando seções rápidas e tubulares.',
      },
      { type: 'h3', text: 'Maré Cheia (Preamar)' },
      {
        type: 'p',
        text:
          'Deixa o mar mais cheio ("gordo"), fazendo as ondas estourarem mais no fundo ou quebrarem com pressão na orla (tombos). Funciona melhor quando há swell forte de Sul (acima de 1,5 m).',
      },
      { type: 'h2', text: 'A Maré na Pesca Esportiva e de Subsistência (Cananéia e Estuário)' },
      { type: 'h3', text: 'Pesca no Canal de Cananéia e Mar de Pequeno' },
      {
        type: 'ul',
        items: [
          '**Início da Maré Enchente:** momento estratégico para a pesca de Robalo e Corvina nos canais estuarinos. A água limpa do oceano entra no estuário trazendo alimento e ativando os predadores.',
          '**Reponto de Maré (Estofo):** período de ~30 minutos entre a maré alta e baixa em que a água para de correr. É o momento exato para pescar em fundo e estruturas.',
        ],
      },
      { type: 'h2', text: 'Extrativismo Caiçara: Coleta de Ostras e Marisco-da-Pedra' },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Técnica de Coleta no Lagamar',
        text:
          'A coleta de ostra-do-mangue e marisco-da-pedra depende exclusivamente da **baixa-mar da Maré de Sizígia**. Quando a maré atinge seus menores níveis (próximos de 0,0 m a 0,2 m na tábua), as pedras dos costões e as raízes de rizófora no mangue ficam acessíveis para a retirada com raspadores tradicionais.',
      },
      {
        type: 'callout',
        tone: 'alert',
        title: 'Coleta legal e sustentável',
        text:
          'Colete apenas onde e quando a lei permitir — regras de tamanho, época (defeso) e autorização das unidades de conservação são definidas pelo órgão gestor ambiental. Consuma apenas de cooperativas locais certificadas do estuário.',
      },
      { type: 'h2', text: 'Onde Conferir a Tábua Oficial e o Mar Agora' },
      {
        type: 'p',
        text:
          'A tábua oficial de marés do litoral de SP é publicada pela **Marinha do Brasil (DHN)** — consulte a tabela oficial antes de sair para a pesca ou a coleta.',
      },
      {
        type: 'p',
        text:
          'Para condições em tempo real do mar (altura, período e direção das ondas) e próximas marés, use o Meteor 2.0: previsão em **/swell?tab=forecast**, spots e níveis de experiência em **/swell?tab=spots** e previsão do tempo das 4 cidades em **/meteorologia**.',
      },
    ],
    faq: [
      {
        q: 'Qual a diferença na tábua de marés entre a praia aberta de Ilha Comprida e a baía de Cananéia?',
        a: 'A praia aberta de Ilha Comprida segue o ciclo oceânico praticamente sem defasagem, enquanto no Mar de Dentro e na baía de Cananéia o pico da maré chega com atraso hidrográfico de cerca de 1 a 2 horas: a onda de maré precisa percorrer os canais do Complexo Lagunar Cananéia-Iguape-Paranaguá. Na prática, quando a tábua marca alta-mar em Ilha Comprida, o estuário ainda está enchendo — e o mesmo vale para a baixa-mar.',
      },
      {
        q: 'Como a Maré de Sizígia altera o surf e o extrativismo de ostras no Lagamar?',
        a: 'Na sizígia (lua nova/cheia) a amplitude é máxima: na praia aberta as ondas ficam mais fortes, com correntes de retorno intensas; no Lagamar a baixa-mar seca expõe bancadas de pedras e raízes de mangue — a janela principal para a coleta de ostra-do-mangue e marisco-da-pedra. Na quadratura (lua crescente/minguante) a amplitude é mínima: mar mais constante para o surf e janela de coleta restrita.',
      },
      {
        q: 'Qual a melhor maré para pescar robalo no canal de Cananéia e estuário do Vale do Ribeira?',
        a: 'O início da maré enchente é a janela estratégica: a água limpa do oceano entra no estuário com alimento e oxigênio, ativando robalo e corvina. O reponto (estofo) — os ~30 minutos de parada entre a maré alta e a baixa — é o melhor momento para pescar em fundo e estruturas. Na sizígia há muita correnteza (chumbada pesada); na quadratura a corrente é suave, ideal para pesca de rodada.',
      },
      {
        q: 'Qual é a maré ideal para a coleta de marisco-da-pedra e ostra-do-mangue?',
        a: 'A baixa-mar da sizígia — níveis próximos de 0,0 m a 0,2 m na tábua — é a maré ideal: a seca máxima expõe os costões rochosos e as raízes de rizófora do mangue. Fora desse ciclo, a janela é curta e a exposição dos bancos, mínima. Colete apenas onde e quando a lei permitir, com raspador tradicional.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar e próximas marés', href: '/swell?tab=forecast' },
      { label: 'Guia de spots e praias', href: '/swell?tab=spots' },
      { label: 'Previsão do tempo (4 cidades)', href: '/meteorologia' },
      { label: 'Status das rodovias e balsa', href: '/noticias#rodovias' },
    ],
    keywords: [
      'tábua de marés ilha comprida',
      'tábua de maré cananéia',
      'maré de sizígia e quadratura',
      'melhor maré para pescar em cananéia',
      'maré surf ilha comprida',
      'coleta de ostra e marisco maré baixa',
    ],
  },
  {
    slug: 'reserva-de-cananeia-manguezais-lagamar',
    title: 'Reserva de Cananéia: Importância dos Manguezais e Preservação no Lagamar',
    metaTitle: 'Reserva de Cananéia: Manguezais e Preservação | Meteor',
    description:
      'Descubra a rica importância ecológica da Baía de Cananéia e de seus manguezais protegidos. Saiba como apoiar o turismo sustentável e a preservação do Lagamar.',
    summary:
      'O que são o Lagamar e os manguezais de Cananéia, por que são patrimônio da humanidade e como visitar o estuário sem impactar o berçário do Mar de Dentro.',
    category: 'Meio Ambiente',
    categoryColor: 'bg-green-500/20 text-green-400',
    date: '2026-08-25',
    readTime: '8 min de leitura',
    imageUrl: '/blog/reserva-cananeia.jpg',
    imageAlt: 'Catador de ostra no mangue ao lado de caiaques e golfinhos na baía de Cananéia',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'A **Reserva de Cananéia**, inserida no Complexo Estuarino-Lagunar de Cananéia-Iguape-Paranaguá (o Lagamar), é uma das regiões mais bem preservadas da Mata Atlântica e foi reconhecida pela Unesco como **Patrimônio Natural da Humanidade**. Seu coração ecológico são os vastos **manguezais**, considerados os grandes berçários naturais do oceano Atlântico Sul, cruciais para a reprodução de peixes, crustáceos e a subsistência de comunidades tradicionais. A preservação dessa área apoia o controle do clima local, a filtragem de sedimentos e o sustento de espécies ameaçadas, exigindo de visitantes, surfistas e pescadores um turismo de baixo impacto, respeito aos ciclos da maré e o apoio às comunidades caiçaras.',
      },
      { type: 'h2', text: 'Manguezais de Cananéia: A Ficha Ecológica do Maior Berçário do Sul Paulista' },
      {
        type: 'table',
        headers: ['Recurso / Espécie', 'Papel Ecológico', 'Ameaças no Dia a Dia', 'Como Ajudar a Proteger'],
        rows: [
          [
            '**Mangue-Vermelho, Branco e Botão**',
            'Fixação do solo, barreira natural contra ressacas e abrigo para fauna.',
            'Descarte inadequado de lixo, erosão de margens por alta velocidade de barcos.',
            'Navegue em baixa velocidade nos canais; pratique o "lixo zero".',
          ],
          [
            '**Bancos de Ostra e Marisco**',
            'Filtragem natural da água e base econômica caiçara.',
            'Sobrepesca e extração fora das regras de tamanho e época (defeso).',
            'Consuma apenas de cooperativas locais e certificadas do estuário.',
          ],
          [
            '**Golfinho-Cinza (Sotalia guianensis)**',
            'Predador de topo que indica a qualidade ambiental da baía.',
            'Linhas de pesca perdidas, colisões com embarcações e poluição sonora.',
            'Mantenha distância de segurança e nunca persiga os grupos de golfinhos.',
          ],
          [
            '**Aves Migratórias (Guarás, Colhereiros)**',
            'Dispersão de nutrientes e equilíbrio da cadeia trófica.',
            'Degradação de áreas de descanso e poluição das praias e copas de árvores.',
            'Evite ruídos excessivos em áreas de nidificação e não se aproxime.',
          ],
        ],
      },
      { type: 'h3', text: 'O que é e por que a Baía de Cananéia é Única?' },
      {
        type: 'p',
        text:
          'A baía abriga ecossistemas integrados de manguezal, restinga e mata atlântica de encosta, impulsionada pelo encontro das águas doces do Vale do Ribeira com as correntes do oceano. Esta dinâmica estuarina faz de Cananéia uma rica maternidade marinha, alimentando o "Mar de Dentro".',
      },
      { type: 'h2', text: 'Tabela Comparativa GEO: O Impacto dos Ciclos de Maré na Conservação do Lagamar' },
      {
        type: 'p',
        text: 'A compreensão dos movimentos da maré é vital tanto para a segurança dos visitantes quanto para as atividades tradicionais sustentáveis:',
      },
      {
        type: 'table',
        headers: ['Característica', 'Maré de Sizígia (Lua Nova / Cheia)', 'Maré de Quadratura (Lua Crescente / Minguante)'],
        rows: [
          ['**Força da Correnteza**', '**Extrema:** grandes volumes de água entram e saem rapidamente do estuário.', '**Suave:** pouca força de corrente nos canais do Lagamar.'],
          ['**Exposição do Ecossistema**', '**Máxima:** a baixa-mar extrema expõe imensas áreas de mangue, facilitando o extrativismo tradicional e as pesquisas.', '**Mínima:** mangues e costões permanecem quase sempre cobertos de água, protegendo micro-habitats.'],
          ['**Navegação e Acesso**', '**Crítica:** bancos de areia perigosos na maré baixa seca; correntezas fortes para pequenas embarcações.', '**Estável:** navegação segura nos canais de travessia (como a balsa Cananéia–Ilha Comprida).'],
          ['**Dinâmica do Lixo e Resíduos**', '**Alto impacto:** a grande variação arrasta detritos da costa para o mangue ou do mangue para o mar.', '**Baixo impacto:** baixa mobilização de detritos, facilitando mutirões de limpeza nas margens.'],
        ],
      },
      { type: 'h2', text: 'Como Contribuir para a Preservação da Reserva e dos Manguezais' },
      { type: 'h3', text: 'Pratique o Ecoturismo Consciente (Turismo Comunitário)' },
      {
        type: 'p',
        text:
          'Valorize as vivências comunitárias e o turismo comunitário tradicional (como na Reserva Extrativista do Mandira e na Ilha do Cardoso). Ao consumir serviços e produtos de comunidades caiçaras, você financia a proteção da floresta e do mar por quem de fato nela habita.',
      },
      { type: 'h3', text: 'Reduza o Impacto nos Passeios e no Surf' },
      {
        type: 'p',
        text:
          'Se você pratica SUP, caiaque ou passeia de barco, evite entrar em canais de manguezal muito estreitos na maré baixa — o atrito pode danificar as raízes aéreas. Guarde todo o seu lixo e recolha qualquer plástico encontrado na água ou no mangue.',
      },
      { type: 'h3', text: 'Respeite as Unidades de Conservação (UCs)' },
      {
        type: 'p',
        text:
          'A Reserva e o Parque Estadual Lagamar de Cananéia possuem regras rígidas sobre fogueiras, acampamentos, descarte de resíduos e poluição sonora. Siga apenas as trilhas oficiais e utilize guias locais autorizados para o acesso a atrativos naturais.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Telemetria para visitar sem impactar',
        text:
          'Antes de sair, cruze maré (janela de coleta e de navegação), vento e chuva no Meteor 2.0: previsão em /meteorologia, marés e ondas em /swell?tab=forecast e spots em /swell?tab=spots.',
      },
    ],
    faq: [
      {
        q: 'O que é o Lagamar de Cananéia e por que ele é um Patrimônio da Humanidade?',
        a: 'O Lagamar é o Complexo Estuarino-Lagunar de Cananéia, Iguape e Paranaguá, um dos maiores e melhores preservados complexos lagunares do Brasil. Por sua integridade e biodiversidade, foi reconhecido pela Unesco como Patrimônio Natural da Humanidade — um mosaico de manguezais, restingas e mata atlântica que sustenta pesca, navegação e vida caiçara.',
      },
      {
        q: 'Qual é o papel ecológico dos manguezais de Cananéia para o Vale do Ribeira?',
        a: 'Os manguezais são berçários naturais: abrigam a fase inicial de peixes, crustáceos e moluscos, filtram sedimentos e poluentes, protegem a costa contra ressacas e marés de tempestade e ainda armazenam carbono (o chamado "carbono azul"). Para o Vale do Ribeira, eles são a base da pesca artesanal, do extrativismo de ostras e mariscos e do turismo comunitário.',
      },
      {
        q: 'Como o turismo sustentável ajuda a preservar a reserva e o Parque Estadual em Cananéia?',
        a: 'O turismo comunitário — como as vivências no Mandira e na Ilha do Cardoso — transforma a floresta e o mar em renda permanente para as famílias caiçaras, criando incentivo direto para a conservação: guias locais, cooperativas de marisco e monitoramento participativo. O impacto baixo (grupos pequenos, trilhas oficiais, zero resíduos) mantém o ecossistema intacto enquanto gera economia local.',
      },
      {
        q: 'Quais as regras de proteção ambiental para visitar a Ilha do Cardoso e a Baía de Cananéia?',
        a: 'As áreas são Unidades de Conservação com regras específicas: acesso por trilhas oficiais e, em trechos de proteção integral, com autorização e/ou guia local autorizado; proibição de fogueira e acampamento fora de áreas permitidas, poluição sonora e descarte de resíduos; nas águas, velocidade reduzida nos canais e distância dos golfinhos. Consulte sempre o órgão gestor antes de sair.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar e próximas marés', href: '/swell?tab=forecast' },
      { label: 'Guia de marés de Ilha Comprida e Cananéia', href: '/blog/tabua-de-mares-ilha-comprida-cananeia' },
      { label: 'Previsão do tempo da região', href: '/meteorologia' },
      { label: 'Notícias e atualizações ambientais', href: '/noticias' },
      { label: 'Roteiros e parceiros locais', href: '/comercio' },
    ],
    keywords: [
      'reserva de cananéia',
      'importância ecológica da baía de cananéia',
      'preservação dos manguezais de cananéia',
      'parque estadual lagamar de cananéia',
      'turismo sustentável vale do ribeira',
      'biodiversidade do lagamar',
    ],
  },
  {
    slug: 'jureia-itinga-praias-surf-ecoturismo',
    title: 'Parque Estadual da Juréia-Itatinga: Praias, Surf e Guia de Ecoturismo',
    metaTitle: 'Juréia-Itatinga: Praias, Surf e Ecoturismo | Meteor 2.0',
    description:
      'Conheça as praias do Parque Estadual da Juréia-Itatinga, entre Iguape, Itanhaém e Peruíbe: onde surfar, trilhas, baleias e dicas de maré para visitar o Lagamar.',
    summary:
      'Guia de ecoturismo e surf na Juréia: praias de mar aberto, canais do Mar de Dentro, baleias de Peruíbe e como cruze maré, vento e swell antes de sair.',
    category: 'Ecoturismo',
    categoryColor: 'bg-teal-500/20 text-teal-400',
    date: '2026-11-06',
    readTime: '7 min de leitura',
    imageUrl: '/blog/jureia.jpg',
    imageAlt: 'Surfistas na praia de mar aberto com a Serra do Mar ao fundo na região da Juréia-Itatinga',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'O **Parque Estadual da Juréia-Itatinga** protege um dos últimos trechos contínuos de Mata Atlântica do litoral sul de São Paulo, entre Iguape, Itanhaém e Peruíbe. As praias de mar aberto — como Juqueriquerê e as faixas da porção norte do parque — combinam águas frias, vento e ondas constantes, atrairando surfistas e praticantes de SUP, enquanto os canais e manguezais do lado do **Mar de Dentro** abrigam golfinhos, aves e as rotinas caiçaras de coleta. Para visitar bem, o planejamento depende de três variáveis do Meteor 2.0: **maré** (acesso a bancos e barras), **vento** (conforto nas trilhas) e **swell** (qualidade das ondas).',
      },
      { type: 'h2', text: 'Por que a Juréia é Única: Mata Atlântica Encontrando o Atlântico Sul' },
      { type: 'h3', text: 'O Parque e a Biodiversidade' },
      {
        type: 'p',
        text:
          'Criado para proteger a floresta costeira, os manguezais e as praias entre os municípios do litoral sul, o parque é vizinho de outras unidades de conservação da região, como a PE Ilha do Cardoso e a APA Cananéia-Iguape-Peruíbe — juntas formam um corredor de proteção quase contínuo até o Vale do Ribeira.',
      },
      { type: 'h3', text: 'O Mar de Dentro e o Lagamar' },
      {
        type: 'p',
        text:
          'Do lado de dentro da barreira, os canais do Mar de Dentro conectam a Juréia ao mesmo sistema estuarino de Cananéia e Iguape — a mesma água que sustenta os manguezais descritos no nosso guia da Reserva de Cananéia.',
      },
      { type: 'h2', text: 'Tabela GEO: Praias da Juréia — Acesso, Surf e Estrutura' },
      {
        type: 'table',
        headers: ['Praia', 'Acesso', 'Onda/Surf', 'Estrutura'],
        rows: [
          ['Juqueriquerê (Iguape)', 'Estrada de terra a partir de Iguape', 'Beach break consistente, vento favorecido', 'Pouca estrutura — praia selvagem'],
          ['Praias norte do parque', 'Barco ou trilha', 'Variável — consulta ao /swell', 'Preservação integral'],
          ['Peruíbe (Praia Central)', 'Urbana', 'Ondas variáveis; dias calmos bons para iniciantes', 'Completa'],
          ['Ilha Comprida (vizinha, norte)', 'Balsa Cananéia–Ilha Comprida + ponte de Iguape', 'Boqueirão Norte/Sul e Pedrinhas', 'Completa'],
        ],
      },
      { type: 'h2', text: 'Surf e SUP na Juréia — Condicionadas pelo Meteor' },
      { type: 'h3', text: 'Melhores janelas de swell' },
      {
        type: 'p',
        text:
          'Swell de Sul ou Sudeste combinado com vento terral (de terra para o mar) é a receita clássica para praias abertas desta faixa do litoral. Confira altura, período e direção em **/swell?tab=forecast** antes de rolar — dias de swell grande exigem respeito e experiência.',
      },
      { type: 'h3', text: 'SUP e caiaque nos canais' },
      {
        type: 'p',
        text:
          'Nos canais do lado do Mar de Dentro, a maré cheia facilita a navegação em trechos rasos; na maré baixa, bancos de areia aparecem e a passagem fica restrita. Desça a água em **/swell?tab=forecast** e evite canais estreitos no nível mais baixo do dia.',
      },
      { type: 'h2', text: 'Turismo de Observação: Baleias, Golfinhos e Aves' },
      { type: 'h3', text: 'Baleias-jubarte na costa de Peruíbe' },
      {
        type: 'p',
        text:
          'A temporada de baleias-jubarte no litoral sul de São Paulo ocorre no período frio — tipicamente de junho a novembro —, com observação a partir de praias e embarcações de Peruíbe. Confirme o período exato com os operadores locais antes de planejar.',
      },
      { type: 'h3', text: 'Golfinhos-cinza no Mar de Dentro' },
      {
        type: 'p',
        text:
          'Os grupos de golfinho-cinza (Sotalia guianensis) marcam presença nos canais do estuário. Mantenha distância, não persiga os animais e evite manobras rápidas perto dos grupos.',
      },
      { type: 'h2', text: 'Planejando a Visita (Checklist)' },
      { type: 'h3', text: 'Como chegar' },
      {
        type: 'p',
        text:
          'Por estrada a partir de Peruíbe ou Iguape, ou de barco pelos canais do estuário. algumas praias do parque exigem registro ou guia local autorizado — confirme as regras vigentes com o órgão gestor antes de sair.',
      },
      { type: 'h3', text: 'Regras das UCs' },
      {
        type: 'p',
        text:
          'Siga apenas as trilhas oficiais, contrate guias locais autorizados, não deixe resíduos e respeite as proibições de fogueira e acampamento fora de áreas permitidas.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Quando ir: cruze maré + vento + swell no app',
        text:
          'Antes de fechar o roteiro, abra /meteorologia (chuva e temperatura), /swell?tab=forecast (maré, ondas e vento) e /swell?tab=spots (níveis de experiência dos spots vizinhos).',
      },
      {
        type: 'callout',
        tone: 'alert',
        title: 'Segurança no mar aberto',
        text:
          'As praias de mar aberto da região não contam com guarda-vidas permanente em toda a faixa, e as correntes de retorno ficam fortes em dias de swell. Confira as condições em /swell?tab=forecast antes de entrar na água.',
      },
    ],
    faq: [
      {
        q: 'O que é o Parque Estadual da Juréia-Itatinga?',
        a: 'É uma unidade de conservação que protege um dos últimos trechos contínuos de Mata Atlântica do litoral sul de São Paulo, entre Iguape, Itanhaém e Peruíbe. Criado para preservar a floresta costeira, os manguezais e as praias, abriga trilhas, praias de mar aberto e canais do Mar de Dentro com grande biodiversidade — de golfinhos a aves migratórias.',
      },
      {
        q: 'Como chegar às praias da Juréia?',
        a: 'De carro, por estradas a partir de Peruíbe ou Iguape (alguns trechos de terra); ou de barco pelos canais do estuário. Algumas praias do parque exigem registro prévio ou guia local autorizado — confirme as regras com o órgão gestor antes de viajar.',
      },
      {
        q: 'Onde surfar na Juréia e Ilha Comprida?',
        a: 'Na Juréia, Juqueriquerê é a praia mais conhecida pelo beach break consistente. Na vizinha Ilha Comprida, os spots de praia aberta incluem Boqueirão Norte, Pedrinhas e Boqueirão Sul — consulte níveis de experiência em /swell?tab=spots e as condições em /swell?tab=forecast.',
      },
      {
        q: 'Quando ver baleias-jubarte no litoral sul de SP?',
        a: 'A temporada ocorre no período frio, tipicamente de junho a novembro na costa de Peruíbe e região. Confirme o período e as saídas de observação com os operadores locais antes de planejar a viagem.',
      },
      {
        q: 'É possível acampar na Juréia?',
        a: 'Apenas em áreas autorizadas e mediante registro, conforme as regras da unidade de conservação. Fora dessas áreas, acampamento e fogueira são proibidos. Consulte o órgão gestor para as normas vigentes.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar e previsão de ondas', href: '/swell?tab=forecast' },
      { label: 'Spots e níveis de experiência', href: '/swell?tab=spots' },
      { label: 'Previsão do tempo da região', href: '/meteorologia' },
      { label: 'Guia de marés de Ilha Comprida e Cananéia', href: '/blog/tabua-de-mares-ilha-comprida-cananeia' },
      { label: 'Reserva de Cananéia e manguezais', href: '/blog/reserva-de-cananeia-manguezais-lagamar' },
    ],
    keywords: [
      'parque estadual da juréia',
      'praias da juréia',
      'juqueriquerê surf',
      'o que fazer em juréia',
      'baleia jubarte peruíbe',
      'turismo ecológico litoral sul sp',
    ],
  },
  {
    slug: 'ilha-comprida-mar-de-dentro-oceano',
    title: 'Ilha Comprida: a Barreira entre o Mar de Dentro e o Oceano',
    metaTitle: 'Ilha Comprida: Mar de Dentro, Oceano e Balsa | Meteor',
    description:
      'Entenda a geografia de Ilha Comprida: de um lado o Mar de Dentro com manguezais e pesca, do outro a praia aberta de surf. Balsa, marés e spots em um só guia.',
    summary:
      'Uma ilha, dois mares: geografia, balsa Cananéia, surf na praia aberta e pesca no Mar de Dentro — com as janelas de maré de cada atividade.',
    category: 'Oceanografia',
    categoryColor: 'bg-emerald-500/20 text-emerald-400',
    date: '2026-11-06',
    readTime: '6 min de leitura',
    imageUrl: '/blog/ilha-comprida.jpg',
    imageAlt: 'Vista aérea de Ilha Comprida com o canal do Mar de Dentro à esquerda, a ilha-barreira ao centro e o Atlântico à direita',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'Ilha Comprida é uma ilha-barreira que separa de um lado o **Mar de Dentro** — o estuário de Iguape/Cananéia com manguezais, canais e pesca de robalo — e do outro o **Atlântico Sul**, com a praia aberta de surf. Essa posição dupla define tudo: o surf segue o ciclo oceânico direto, a pesca no estuário segue a maré com atraso de 1 a 2 horas, e a logística da travessia depende da balsa Cananéia–Ilha Comprida e da ponte de Iguape.',
      },
      { type: 'h2', text: 'Dois Mundos em Uma Ilha' },
      {
        type: 'table',
        headers: ['Característica', 'Oceano (litoral leste)', 'Mar de Dentro (litoral oeste)'],
        rows: [
          ['Água', 'Salgada, clara, com swell direto do Sul/Sudeste', 'Salobra, influência de rios e manguezais'],
          ['Maré', 'Ciclo oceânico praticamente sem defasagem', 'Pico com atraso de ~1 a 2 horas vs. praia aberta'],
          ['Surf', 'Beach break: Boqueirão Norte, Pedrinhas, Boqueirão Sul', 'Sem surf de praia —SUP e caiaque nos canais'],
          ['Pesca', 'Pesca de praia e surflandia', 'Robalo e corvina em canais e margens de mangue'],
          ['Sizígia', 'Ondas mais fortes e correntes de retorno intensas', 'Baixa-mar seca expõe bancos e raízes de mangue'],
        ],
      },
      { type: 'h2', text: 'A Balsa e as Acessos' },
      {
        type: 'p',
        text:
          'A travessia de balsa entre Cananéia e Ilha Comprida é o elo logístico da ilha — o veículo oficial para o lado do Mar de Dentro —, complementada pela ponte de Iguape. Em dias de maré baixa extrema, atenção redobrada nos canais: bancos de areia aparecem e a navegação fica crítica para pequenas embarcações.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Status da balsa e das rotas em tempo real',
        text:
          'Confira o status das rodovias e travessias em /noticias#rodovias (SP-222, BR-116 e acesso à região) antes de sair de casa.',
      },
      { type: 'h2', text: 'Surf em Ilha Comprida' },
      {
        type: 'p',
        text:
          'Boqueirão Norte, Pedrinhas e Boqueirão Sul formam o trio de spots da praia aberta. A maré média (secando para enchendo) é a janela de ouro para seções rápidas; com swell forte de Sul, a preamar deixa o mar mais gordo e exigente. Consulte as condições em **/swell?tab=forecast** e os níveis de experiência em **/swell?tab=spots**.',
      },
      { type: 'h2', text: 'Pesca no Mar de Dentro' },
      {
        type: 'p',
        text:
          'No lado oeste, a janela clássica para robalo e corvina é o **início da maré enchente** (água limpa entrando com alimento) e o **reponto** — os ~30 minutos de parada entre a maré alta e a baixa. Como o estuário atrasa em relação à praia aberta, some 1 a 2 horas à tábua oficial de Ilha Comprida. Detalhes no nosso guia de tábua de marés.',
      },
    ],
    faq: [
      {
        q: 'O que é Ilha Comprida?',
        a: 'Ilha Comprida é uma ilha-barreira do litoral sul de São Paulo: de um lado o Oceano Atlântico com praias abertas de surf, do outro o Mar de Dentro — o estuário de Iguape e Cananéia com manguezais, canais e pesca. A vila, a estrada de terra e a balsa com Cananéia conectam os dois mundos.',
      },
      {
        q: 'Como funciona a balsa Cananéia–Ilha Comprida?',
        a: 'A balsa é a travessia oficial entre Cananéia e a ilha pelo lado do Mar de Dentro, alternativa (ou complemento) à ponte de Iguape. Em maré baixa extrema, bancos de areia aparecem nos canais — confira o status da travessia e das rodovias em /noticias#rodovias antes de sair.',
      },
      {
        q: 'Qual a melhor maré para surfar em Ilha Comprida?',
        a: 'A maré média — secando para enchendo — é a janela mais consistente: a água em movimento uniformiza a bancada de areia e cria seções rápidas em Boqueirão Norte, Pedrinhas e Boqueirão Sul. Na preamar com swell de Sul forte, o mar fica mais gordo e técnico. Confira as condições em /swell?tab=forecast.',
      },
      {
        q: 'Por que a maré em Cananéia atrasa em relação à praia?',
        a: 'A onda de maré precisa percorrer os canais do Complexo Lagunar Cananéia-Iguape-Paranaguá até chegar ao estuário, o que gera um atraso hidrográfico de cerca de 1 a 2 horas no pico em relação à praia aberta de Ilha Comprida. Na prática, quando a tábua marca alta-mar na praia, o Mar de Dentro ainda está enchendo.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar e próximas marés', href: '/swell?tab=forecast' },
      { label: 'Spots e níveis de experiência', href: '/swell?tab=spots' },
      { label: 'Guia de tábua de marés', href: '/blog/tabua-de-mares-ilha-comprida-cananeia' },
      { label: 'Status das rodovias e balsa', href: '/noticias#rodovias' },
      { label: 'Previsão do tempo da região', href: '/meteorologia' },
    ],
    keywords: [
      'ilha comprida mar de dentro',
      'balsa cananéia ilha comprida',
      'surf ilha comprida boqueirão',
      'pesca robalo mar de dentro',
      'geografia ilha barreira litoral sul sp',
    ],
  },
  {
    slug: 'ventos-de-sudeste-o-que-esperar-no-inverno',
    title: 'Ventos de Sudeste: O Que Esperar no Inverno',
    metaTitle: 'Ventos de Sudeste no Inverno | Meteor 2.0',
    description:
      'Como o vento de sudeste molda o inverno no Litoral Sul de SP: ondas, temperatura da água e os padrões de vento que o surfista precisa conhecer antes de sair.',
    summary:
      'O padrão de vento que domina o inverno da região e o que ele significa para ondas, temperatura e dias de praia.',
    category: 'Clima',
    categoryColor: 'bg-amber-500/20 text-amber-400',
    date: '2026-09-01',
    readTime: '5 min de leitura',
    imageUrl: '/blog/ventos-de-sudeste.jpg',
    imageAlt: 'Céu encoberto e mar agitado em dia de vento de sudeste no litoral sul de São Paulo',
    author: 'Carlos Alexandre',
    status: 'coming-soon',
    content: [],
    relatedLinks: [
      { label: 'Previsão do tempo (4 cidades)', href: '/meteorologia' },
      { label: 'Condições do mar e vento', href: '/swell?tab=forecast' },
    ],
    keywords: ['vento de sudeste inverno litoral sul', 'padrão de vento ilha comprida', 'previsão de vento litoral sul sp'],
  },
  {
    slug: 'dinamica-costeira-vale-do-ribeira',
    title: 'Dinâmica Costeira do Vale do Ribeira',
    metaTitle: 'Dinâmica Costeira do Vale do Ribeira | Meteor 2.0',
    description:
      'Correntes, transporte de sedimentos e a formação das barreiras costeiras no Vale do Ribeira — o motor geológico por trás de Ilha Comprida e do Lagamar.',
    summary:
      'Como o Rio Ribeira, as correntes longshore e o swell esculpem o litoral entre Peruíbe e Cananéia.',
    category: 'Oceanografia',
    categoryColor: 'bg-emerald-500/20 text-emerald-400',
    date: '2026-08-28',
    readTime: '6 min de leitura',
    imageUrl: '/blog/dinamica-costeira.jpg',
    imageAlt: 'Encontro de águas do rio com o oceano na desembocadura do Vale do Ribeira',
    author: 'Carlos Alexandre',
    status: 'coming-soon',
    content: [],
    relatedLinks: [
      { label: 'Condições do mar', href: '/swell?tab=forecast' },
      { label: 'Guia de marés de Ilha Comprida e Cananéia', href: '/blog/tabua-de-mares-ilha-comprida-cananeia' },
    ],
    keywords: ['dinâmica costeira vale do ribeira', 'transporte de sedimentos ilha comprida', 'correntes costeiras litoral sul'],
  },
];

/** Posts publicados, em ordem decrescente de data. */
export const publishedPosts = (): BlogPost[] =>
  BLOG_POSTS.filter(p => p.status === 'published').sort((a, b) => b.date.localeCompare(a.date));

/** Cards "em breve" (sem link) na ordem original. */
export const comingSoonPosts = (): BlogPost[] => BLOG_POSTS.filter(p => p.status === 'coming-soon');

/** Lookup por slug (retorna `undefined` para slugs desconhecidos/coming-soon). */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug && p.status === 'published');
}
