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
    title: 'Acesso à Juréia em Iguape: Balsa de Icapara, Barra do Ribeira e Costão da Juréia',
    metaTitle: 'Juréia em Iguape: Balsa, Barra do Ribeira e Costão',
    description:
      'Saiba como chegar à Praia da Juréia em Iguape: balsa de Icapara ao bairro Barra do Ribeira, horários, tarifa e o acesso ao Costão pela tábua de maré oficial.',
    summary:
      'Rota em três etapas para a única praia de Iguape: balsa de Icapara, bairro Barra do Ribeira e acesso ao Costão da Juréia condicionado à maré.',
    category: 'Ecoturismo',
    categoryColor: 'bg-teal-500/20 text-teal-400',
    date: '2026-11-06',
    readTime: '8 min de leitura',
    imageUrl: '/blog/jureia.jpg',
    imageAlt: 'Surfistas em ondas na praia de mar aberto da Juréia com a Serra do Mar ao fundo sob céu nublado',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'Não existe acesso de carro direto até a **Praia da Juréia**, em Iguape: a rota oficial tem três etapas — até a cidade de Iguape, travessia do Rio Ribeira de Iguape na **balsa de Icapara** (cerca de 5 minutos, partidas a cada 30 minutos das 7h às 20h30, tarifa paga apenas na volta e somente em dinheiro) e chegada ao **bairro Barra do Ribeira**, conhecido localmente como "Barra da Juréia", onde começa a única praia de Iguape, com 19 km de extensão. No extremo da praia fica o **Costão da Juréia**, dentro da PE Prelado, cujo acesso pelas pequenas barras naturais depende da tábua de maré.',
      },
      { type: 'h2', text: 'Como Chegar à Juréia: A Rota em Três Etapas' },
      {
        type: 'p',
        text:
          'O erro mais comum de quem viaja para a Juréia é tentar chegar de carro direto à praia. Não há estrada: o percurso oficial atravessa Iguape e usa a balsa sobre o Rio Ribeira de Iguape. Confira as três etapas antes de sair de casa.',
      },
      {
        type: 'table',
        headers: ['Etapa', 'Trajeto', 'Meio', 'Tempo estimado'],
        rows: [
          [
            '1ª',
            'Até Iguape — terminal da balsa na Estrada Vereador Manoel Alves da Silva, s/n (Icapara)',
            "Carro, táxi coletivo (partida na Rua Porto General Câmara) ou ônibus linhas 9 e 10 do Terminal Sant'Anna de Moraes",
            'Conforme sua origem',
          ],
          ['2ª', 'Travessia do Rio Ribeira de Iguape, de Iguape para a Juréia', 'Balsa Iguape–Juréia', 'Cerca de 5 minutos'],
          [
            '3ª',
            'Terminal da Juréia (Avenida Sebastião Marques, 500) até o bairro Barra do Ribeira e a praia',
            'Táxi coletivo ou carro',
            'Poucos minutos até a orla',
          ],
        ],
      },
      { type: 'h2', text: 'Balsa de Icapara: Horários, Tarifa e Regras' },
      {
        type: 'p',
        text:
          'A balsa Iguape–Juréia é o único veículo oficial de travessia e concentra a dúvida de todo visitante. O embarque é gratuito na ida e a tarifa é cobrada apenas na volta (Juréia → Iguape), sempre em dinheiro — não há pagamento por cartão a bordo.',
      },
      {
        type: 'table',
        headers: ['Item', 'Informação'],
        rows: [
          ['Horários', 'Partidas a cada 30 minutos, das 7h às 20h30, com viagens às 21h30, 22h30 e 23h30'],
          ['Travessia', 'Cerca de 5 minutos sobre o Rio Ribeira de Iguape, partindo de Icapara'],
          ['Espera média', 'Aproximadamente 30 minutos no terminal antes do embarque'],
          ['Tarifa', 'Paga somente na volta (Juréia → Iguape); na ida o embarque é gratuito'],
          ['Pagamento', 'Somente em dinheiro (espécie) — não há pagamento por cartão'],
          ['Gratuidade', 'Pedestres e ciclistas atravessam de graça'],
          [
            'Veículos',
            'Carros: R$ 12,30 em dias úteis e R$ 18,40 em fins de semana (valores de 09/2024 — confirme antes de viajar)',
          ],
          ['Hora Marcada', 'Veículos maiores devem reservar o horário pela central 0800 77 33 711'],
        ],
      },
      {
        type: 'callout',
        tone: 'alert',
        title: 'Confirme a balsa antes de sair',
        text:
          'A SEMIL alerta que as informações publicadas sobre a travessia podem ficar desatualizadas. Ligue para a central 0800 77 33 711 ou confira o status das rodovias e travessias em /noticias#rodovias antes de sair de casa.',
      },
      { type: 'h2', text: 'Barra do Ribeira: o Bairro que Recebe o Viajante' },
      {
        type: 'p',
        text:
          'A **Praia da Juréia** tem cerca de 19 km e é a única praia de Iguape. Ela começa no bairro **Barra do Ribeira** — o mesmo lugar que os locais chamam de "Barra da Juréia" —, onde ficam o terminal da balsa, pousadas, restaurantes e o acesso à areia.',
      },
      {
        type: 'ul',
        items: [
          '**Trilha Ecológica da Vila Alegria:** cerca de 300 m de passarela sobre a mata e uma casa histórica do século XIX.',
          '**Orla do Rio Suamirim:** caminhada tranquila no bairro, com vista para o encontro de águas da foz do Ribeira.',
          '**Estrutura local:** pousadas e restaurantes de peixe no próprio bairro — reserve com antecedência em feriados e alta temporada.',
        ],
      },
      { type: 'h2', text: 'Acesso ao Costão da Juréia: a Maré Manda' },
      {
        type: 'p',
        text:
          'No extremo da praia fica o **Costão da Juréia**, dentro do Parque Estadual da Juréia-Itatinga — mais precisamente na área da PE Prelado (Lei Estadual 14.982/2013, 1.828 hectares), administrada pelo Núcleo Costão da Juréia. O acesso é gratuito, das 8h às 17h, pelo quilômetro 225 da Praia da Juréia — e depende da maré: pequenas barras naturais se formam no caminho.',
      },
      {
        type: 'table',
        headers: ['Situação da maré', 'O que acontece nas barras', 'Janela de acesso ao Costão'],
        rows: [
          [
            'Sizígia (lua nova/cheia)',
            'Amplitude máxima: as barras naturais podem secar por completo na baixa-mar',
            'Acesso possível apenas na janela da baixa-mar — anote o horário da tábua antes de sair',
          ],
          [
            'Quadratura (lua crescente/minguante)',
            'Amplitude mínima: menos variação de nível nas barras ao longo do dia',
            'Janela mais estável e previsível, mas ainda assim depende do horário da maré do dia',
          ],
          [
            'Qualquer ciclo',
            'Pequenas barras naturais se formam e mudam de posição no trecho de acesso',
            'Consulte a tábua oficial de maré e confirme com o Núcleo Costão da Juréia (13 3841-2193)',
          ],
        ],
      },
      { type: 'h2', text: 'Trilhas do Costão e da ESEC Juréia-Itatins' },
      {
        type: 'ul',
        items: [
          '**Trilha Praia → Costão:** cerca de 7 km, aproximadamente 3 horas, autoguiada, saindo do bairro Barra do Ribeira ao longo da areia.',
          '**Cachoeira do Pocinho:** trilha curta de cerca de 500 m até a cachoeira.',
          '**Trilha do Imperador (Telégrafo):** 27 a 28 km na ESEC Juréia-Itatins, com monitor obrigatório e agendamento prévio — não é trilha autoguiada.',
          '**ESEC Juréia-Itatins:** abrange os municípios de Iguape, Itariri, Miracatu e Peruíbe — confirme regras, agendamento e horários com o órgão gestor antes de sair.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Quando ir: cruze maré + vento + swell no app',
        text:
          'Antes de fechar o roteiro, abra /meteorologia (chuva e temperatura), /swell?tab=forecast (maré, ondas e vento) e /swell?tab=spots (níveis de experiência dos spots vizinhos).',
      },
      { type: 'h2', text: 'Surf na Juréia e as Condições do Meteor' },
      {
        type: 'p',
        text:
          'Os 19 km da Praia da Juréia são mar aberto: swell de Sul ou Sudeste combinado com vento terral é a receita clássica para as ondas desta faixa. Confira altura, período e direção em **/swell?tab=forecast** e os níveis de experiência em **/swell?tab=spots** antes de rolar — dias de swell grande exigem respeito e experiência.',
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
        q: 'Como chegar à Praia da Juréia de Iguape?',
        a: 'A Praia da Juréia não tem acesso de carro direto: a rota é até Iguape, travessia do Rio Ribeira de Iguape na balsa de Icapara (cerca de 5 minutos) e chegada ao bairro Barra do Ribeira, onde começa a praia. De lá até a areia são poucos minutos de táxi coletivo ou carro.',
      },
      {
        q: 'Quanto custa a balsa de Iguape para a Juréia e quais são os horários?',
        a: 'O embarque é gratuito na ida e a tarifa é paga apenas na volta (Juréia → Iguape), somente em dinheiro: R$ 12,30 em dias úteis e R$ 18,40 em fins de semana para carros (valores de 09/2024 — confirme). As partidas são a cada 30 minutos, das 7h às 20h30, com viagens às 21h30, 22h30 e 23h30; pedestres e ciclistas atravessam de graça.',
      },
      {
        q: 'Barra da Juréia é o mesmo que Barra do Ribeira?',
        a: 'Sim. Barra da Juréia é o nome popular com que os locais chamam o bairro Barra do Ribeira, em Iguape, ponto de chegada da balsa e início da Praia da Juréia — a única praia do município, com cerca de 19 km. É no bairro que ficam o terminal, pousadas, restaurantes e o acesso à trilha da Vila Alegria.',
      },
      {
        q: 'Como funciona o acesso ao Costão da Juréia conforme a maré?',
        a: 'O Costão fica no extremo da praia, dentro da PE Prelado, e o acesso passa por pequenas barras naturais que mudam com a maré: na sizígia a janela acontece só na baixa-mar, enquanto na quadratura a variação é menor e a travessia fica mais estável. Confirme o horário na tábua oficial e com o Núcleo Costão da Juréia (13 3841-2193), das 8h às 17h.',
      },
      {
        q: 'Onde surfar na Juréia e como conferir as condições?',
        a: 'A Praia da Juréia é mar aberto dos 19 km, com swell de Sul ou Sudeste e vento terral como melhor combinação. Antes de sair, confira altura, período e direção das ondas em /swell?tab=forecast e os níveis de experiência em /swell?tab=spots — as correntes de retorno ficam fortes em dias de swell grande.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar e previsão de ondas', href: '/swell?tab=forecast' },
      { label: 'Spots e níveis de experiência', href: '/swell?tab=spots' },
      { label: 'Previsão do tempo da região', href: '/meteorologia' },
      { label: 'Status das rodovias e da balsa', href: '/noticias#rodovias' },
      { label: 'Guia de marés de Ilha Comprida e Cananéia', href: '/blog/tabua-de-mares-ilha-comprida-cananeia' },
    ],
    keywords: [
      'acesso à praia da juréia',
      'balsa iguape juréia',
      'barra do ribeira juréia',
      'costão da juréia trilha',
      'como chegar na juréia',
      'surf juréia iguape',
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
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'O **vento de sudeste** é o padrão que domina boa parte do **inverno no Litoral Sul de SP**: sopra do quadrante sudeste sobre o oceano, associado à circulação de alta pressão no Atlântico Sul e aos períodos pós-frontais. Para a praia, ele significa **céu encoberto, mar de cara (onshore) nas praias voltadas a leste** e vento local que gera ondas curtas e bagunçadas — enquanto o **terral** (vento de terra, vindo do quadrante noroeste/norte) é a janela mais limpa para o surf. Com ele também vem o resfriamento: no inverno a água do mar da região costuma ficar na **faixa de 18 a 20 °C**.',
      },
      { type: 'h2', text: 'De Onde Vem o Vento de Sudeste' },
      {
        type: 'p',
        text:
          'No inverno, a alta subtropical do Atlântico Sul empurra ar marítimo úmido em direção à costa paulista. Depois de cada frente fria que passa pelo Sul do país, a circulação de superfície se reorganiza e o vento passa a soprar de **sudeste (SE)** sobre o mar — trazendo umidade, neblina na orla e ressaca discreta. É o vento de "fim de inverno chuvoso e cinzento" que todo morador da região reconhece.',
      },
      {
        type: 'table',
        headers: ['Padrão de vento', 'Quadrante', 'Efeito no mar e na praia'],
        rows: [
          ['**Sudeste (SE)**', 'Marítimo (de fora)', 'Céu encoberto, mar agitado e ondas curtas de vento (windswell); onshore nas praias a leste'],
          ['**Terral (NO/N)**', 'Terrestre (de dentro)', 'Manhãs de mar liso e luz limpa — a melhor janela para o surf e para fotos na praia'],
          ['**Sul/Sudoeste pós-frontal**', 'Polar (de sul)', 'Ar mais seco e frio, rajadas, mar de sul e swell de maior período'],
          ['**Noroeste pré-frontal**', 'Terrestre (quentão)', 'Dia abafado, quente e sem vento — o "calor antes da trova" das frentes frias'],
        ],
      },
      { type: 'h2', text: 'O Que o Vento de Sudeste Faz com as Ondas' },
      {
        type: 'p',
        text:
          'O vento de sudeste **não cria swell de verdade** — ele cria vento-swell: ondas curtas, irregulares e de pouco período, que só "servem" para quem está desesperado por mar. Nas praias de mar aberto da região (Juréia, Ilha Comprida), ele sopra de cara ou de través, saindo a espuma e "abrilhantando" a face da onda. Quando ele coincide com um swell de sul, o resultado é mar confuso; quando ele cede para o terral, a mesma onda fica limpa.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'A call rápida antes de sair',
        text:
          'Abra /swell?tab=forecast e olhe vento, altura e período juntos: SE com período curto = mar bagunçado; terral com período longo = janela limpa. Em /swell?tab=spots você confere o nível de experiência de cada spot da região.',
      },
      { type: 'h2', text: 'Temperatura da Água e do Ar no Inverno' },
      {
        type: 'ul',
        items: [
          '**Água do mar:** em geral entre **18 e 20 °C** no inverno, com quedas mais profundas em frentes frias fortes — muita gente sai do mar de blusa de neoprene 3/2 ou 4/3.',
          '**Ar:** noites mais frescas na orla e madrugadas de neblina em dias de vento de sudeste estável.',
          '**Sensação:** o vento constante do quadrante SE "rouba" calor — o que parece 20 °C na tábua, na praia com vento senta como menos.',
        ],
      },
      { type: 'h2', text: 'Quando Observar Esse Padrão' },
      {
        type: 'p',
        text:
          'O pico do padrão é **junho a agosto**, mas ventos de sudeste persistem em setembro e outubro, especialmente entre frentes frias. Confira a previsão das 4 cidades da região em **/meteorologia** e cruze com o vento em **/swell?tab=forecast** — no inverno a regra é: **planifique a sessão pelo vento, não só pela altura da onda**.',
      },
      {
        type: 'callout',
        tone: 'alert',
        title: 'Atenção com o mar de sudeste',
        text:
          'Vento de sudeste sustentado empurra água para a costa e intensifica as correntes de retorno nas praias de mar aberto. Confira as condições em /swell?tab=forecast antes de entrar na água.',
      },
    ],
    faq: [
      {
        q: 'O que é vento de sudeste no inverno?',
        a: 'É o vento que sopra do quadrante sudeste sobre o oceano, associado à circulação de alta pressão no Atlântico Sul e aos períodos pós-frontais no Sul do país. No Litoral Sul de SP ele traz umidade, céu encoberto, neblina na orla e mar agitado — é o padrão mais recorrente do inverno na região.',
      },
      {
        q: 'Vento de sudeste é bom para surfar?',
        a: 'Em geral não: ele sopra de cara nas praias voltadas a leste e gera ondas curtas e bagunçadas (windswell). A janela limpa do inverno é o terral (vento de terra, quadrante noroeste/norte), que deixa a face da onda lisa. Quando o sudeste cede e entra o terral com swell de sul, o mar fica bom.',
      },
      {
        q: 'Qual a temperatura da água do mar no inverno no Litoral Sul de SP?',
        a: 'Em geral entre 18 e 20 °C, com quedas mais profundas em frentes frias fortes. Com o vento de sudeste constante, a sensação de frio na praia aumenta — blusa de neoprene 3/2 ou 4/3 é o padrão para a maioria dos surfistas da região no inverno.',
      },
      {
        q: 'Qual a diferença entre vento de sudeste e terral?',
        a: 'O vento de sudeste vem do mar (quadrante SE) e bagunça a superfície; o terral vem da terra (quadrante NO/N na região) e sopra geralmente de madrugada e nas primeiras horas do dia, deixando o mar liso. Por isso o terral é a janela preferida dos surfistas e dos pescadores de madrugada.',
      },
    ],
    relatedLinks: [
      { label: 'Previsão do tempo (4 cidades)', href: '/meteorologia' },
      { label: 'Condições do mar e vento', href: '/swell?tab=forecast' },
      { label: 'Spots e níveis de experiência', href: '/swell?tab=spots' },
      { label: 'Alertas e rodovias', href: '/noticias' },
    ],
    keywords: [
      'vento de sudeste inverno litoral sul',
      'padrão de vento ilha comprida',
      'previsão de vento litoral sul sp',
      'vento terral no surf',
      'temperatura da água do mar no inverno em são paulo',
    ],
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
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'A dinâmica costeira do Vale do Ribeira é comandada por três forças: a **descarga do Rio Ribeira de Iguape**, que traz sedimento da Serra do Mar até o estuário; o **transporte litorâneo de sedimentos gerado pelas ondas** — nas praias do litoral sul paulista, estudos de erosão e progradação de Ilha Comprida apontam deriva líquida para **nordeste**, no sentido sul → Ilha Comprida; e a **oscilação da maré**, que redistribui areia nos canais do Complexo Lagunar. Juntas, elas esculpem **Ilha Comprida** (ilha-barreira), sustentam os manguezais do **Lagamar** e modelam os costões da **Juréia** — e explicam por que a erosão de uma praia costuma ser sintoma de um desequilíbrio em outro ponto da costa.',
      },
      { type: 'h2', text: 'Três Forças que Esculpem a Costa' },
      {
        type: 'table',
        headers: ['Força', 'Origem', 'Efeito na costa'],
        rows: [
          [
            '**Descarga fluvial**',
            'Rio Ribeira de Iguape — um dos maiores rios do estado de São Paulo, com bacia no Vale do Ribeira',
            'Aporte de sedimento no estuário; formação de bancos, praias e a barreira que protege o Mar de Dentro',
          ],
          [
            '**Transporte litorâneo**',
            'Ângulo de chegada das ondas de sul e sudeste sobre a linha de costa',
            'Deslocamento de areia ao longo da praia (deriva); praias ganham ou perdem areia conforme o balanço',
          ],
          [
            '**Maré e ventos locais**',
            'Ciclo de maré (sizígia/quadratura) e ventos como o sudeste e o terral',
            'Redistribuição de sedimentos nos canais, nas barras e na boca do estuário — e atraso hidrográfico no Lagamar',
          ],
        ],
      },
      { type: 'h2', text: 'Como Ilha Comprida Se Formou' },
      {
        type: 'p',
        text:
          'Ilha Comprida é uma **ilha-barreira**: uma faixa de areia paralela ao mar que separa o Atlântico do Mar de Dentro. Ela nasceu do encontro entre o sedimento do Rio Ribeira e o transporte litorâneo — ondas que chegam em ângulo empurram a areia ao longo da costa, e onde a energia cai, ela se acumula. Essa faixa é viva: tempestades abrem e fecham barras, a maré remodela as extremidades e o vento esculpe as dunas que fixam a vegetação de restinga.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Uma ilha, dois mares',
        text:
          'De um lado a praia aberta com swell direto; do outro o Mar de Dentro com manguezais e atraso de maré de 1 a 2 horas. Essa dualidade é detalhada no guia Ilha Comprida: a Barreira entre o Mar de Dentro e o Oceano.',
      },
      { type: 'h2', text: 'O Lagamar e os Manguezais: a Zona de Passagem' },
      {
        type: 'p',
        text:
          'Os sedimentos que chegam ao estuário não param: a maré os move e os manguezais os prendem. As raízes de rizófora amortecem a correnteza, capturam partículas e constroem solo — é o motor por trás dos bancos de ostra e marisco do Lagamar e da filtragem natural da água. Quando o aporte de sedimento muda (por exemplo, em anos de chuva intensa no Vale do Ribeira), a dinâmica dos canais muda junto: bancos aparecem, canais alargam e a navegação precisa de atenção redobrada.',
      },
      { type: 'h2', text: 'O Que Muda com o Clima' },
      {
        type: 'ul',
        items: [
          '**El Niño e chuva acima da média:** mais descarga do Rio Ribeira significa mais sedimento suspensido no estuário e maior risco de cheias no Vale do Ribeira.',
          '**Frentes frias e ressacas:** episódios de swell forte aceleram a erosão da barreira e remobilizam areia das praias expostas.',
          '**Mar mais quente:** anomalias térmicas prolongadas alteram a circulação de superfície e a energia disponível para os processos costeiros.',
          '**Ciclo natural:** erosão e progradação são fases do mesmo sistema — a areia "some" de uma praia e reaparece em outro ponto da célula de deriva.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'A direção da deriva depende do swell',
        text:
          'A deriva litorânea é gerada pelo ângulo de chegada das ondas: muda o swell, muda o sentido do transporte de areia. Acompanhe altura, período e direção em /swell?tab=forecast e cruze com /meteorologia (vento e chuva) para entender o mar do dia.',
      },
      { type: 'h2', text: 'Onde Acompanhar o Mar em Tempo Real' },
      {
        type: 'p',
        text:
          'Condições do mar e próximas marés em **/swell?tab=forecast**, spots e níveis de experiência em **/swell?tab=spots**, chuva e vento das 4 cidades em **/meteorologia** e alertas de rodovias e travessias em **/noticias#rodovias**.',
      },
    ],
    faq: [
      {
        q: 'O que é dinâmica costeira?',
        a: 'É o conjunto de processos que movimentam e remodelam a linha costeira: ondas e correntes marinhas geram o transporte litorâneo de sedimentos, os rios trazem material do continente, e a maré e os ventos redistribuem tudo. No Vale do Ribeira, esses processos criaram e mantêm Ilha Comprida, os bancos do estuário e os manguezais do Lagamar.',
      },
      {
        q: 'Como Ilha Comprida se formou?',
        a: 'Como ilha-barreira: o sedimento aportado pelo Rio Ribeira de Iguape foi deslocado ao longo da costa pelo transporte litorâneo gerado pelas ondas e se acumulou onde a energia diminuiu, formando uma faixa de areia paralela ao mar que separa o Atlântico do Mar de Dentro. Dunas e vegetação de restinga fixam a faixa, que continua se movendo com tempestades e marés.',
      },
      {
        q: 'Qual o papel do Rio Ribeira na costa?',
        a: 'O Rio Ribeira de Iguape é a principal fonte de sedimento da região: sua descarga alimenta os bancos do estuário, ajuda a sustentar as praias e a barreira de Ilha Comprida e define a dinâmica dos canais do Lagamar. Em períodos de chuva intensa — como os anos de El Niño — a descarga aumenta, com mais sedimento em suspensão e maior risco de cheias no vale.',
      },
      {
        q: 'Por que algumas praias do litoral sul perdem areia?',
        a: 'Porque o transporte litorâneo é um balanço: a areia que sai de um ponto precisa chegar em outro. Quando muda o padrão de ondas, uma tempestade removente acelera a erosão ou um obstáculo natural interrompe o fornecimento, a praia fica no vermelho. Em Ilha Comprida, estudos apontam deriva líquida para nordeste — e a Ilha do Cardoso atua como obstáculo natural aos sedimentos vindos do sul.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar', href: '/swell?tab=forecast' },
      { label: 'Guia de marés de Ilha Comprida e Cananéia', href: '/blog/tabua-de-mares-ilha-comprida-cananeia' },
      { label: 'Ilha Comprida: Mar de Dentro e Oceano', href: '/blog/ilha-comprida-mar-de-dentro-oceano' },
      { label: 'El Niño 2026 no Litoral Sul', href: '/blog/el-nino-2026-litoral-sul-sp' },
      { label: 'Previsão do tempo da região', href: '/meteorologia' },
    ],
    keywords: [
      'dinâmica costeira vale do ribeira',
      'transporte de sedimentos ilha comprida',
      'correntes costeiras litoral sul',
      'ilha-barreira formação',
      'deriva litorânea são paulo',
    ],
  },
  {
    slug: 'el-nino-2026-litoral-sul-sp',
    title: 'El Niño em 2026: o Que a Temporada Significa para o Litoral Sul de SP',
    metaTitle: 'El Niño 2026 no Litoral Sul de SP | Meteor 2.0',
    description:
      'El Niño 2026 é o mais forte desde 1950 e segue até 2027. Veja o impacto no Litoral Sul de SP: chuva acima da média, mar quente e risco de cheias no verão.',
    summary:
      'A temporada de El Niño de 2026/2027 em números oficiais e o que ela muda para chuva, mar, rios e rotas do Litoral Sul Paulista.',
    category: 'Clima',
    categoryColor: 'bg-amber-500/20 text-amber-400',
    date: '2026-11-07',
    readTime: '7 min de leitura',
    imageUrl: '/blog/el-nino-2026.jpg',
    imageAlt: 'Céu carregado e chuva sobre o mar em dia de temporal no Litoral Sul de São Paulo',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'O **El Niño de 2026** foi confirmado em junho e bateu recorde em outubro, com anomalia mensal de **+2,47 °C** — o maior desvio da série histórica para o mês. O Painel El Niño (INMET, INPE, ANA, CEMADEN, SGB, SEDEC e CENSIPAM) projeta **95% de chance de intensidade muito forte entre outubro e dezembro** — potencialmente o El Niño mais intenso desde 1950 — e **persistência pelo menos até o início de 2027**. Para o **Litoral Sul de SP e o Vale do Ribeira**, o cenário da temporada é de **chuva acima da média**, **temperaturas acima do normal** e **maior risco de cheias e deslizamentos**, sobretudo no verão.',
      },
      { type: 'h2', text: 'O Que É o El Niño e Por Que 2026 é Diferente' },
      {
        type: 'p',
        text:
          'O El Niño é o aquecimento anômalo das águas do Pacífico Equatorial. Em 2026, as condições foram **confirmadas em junho** e o aquecimento seguiu crescendo: no fim de setembro, as anomalias de temperatura da superfície do mar superaram **2 °C** nas áreas central e leste do Pacífico (dados da agência norte-americana CPC/NOAA). Outubro de 2026 fechou com desvio mensal de **+2,47 °C**, recorde da série histórica para o mês.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Fonte oficial da previsão',
        text:
          'Os números vêm do Boletim nº 4 do Painel El Niño, publicado em 30/09/2026 pelo INMET em parceria com INPE, ANA, CEMADEN, SGB, SEDEC e CENSIPAM. Previsões sazonais indicam tendências — o impacto local depende da evolução do tempo dia a dia.',
      },
      { type: 'h2', text: 'Tabela Comparativa GEO: O Que a Temporada de 2026/2027 Reserva' },
      {
        type: 'table',
        headers: ['Região / Variável', 'Previsão da temporada', 'Leitura no Litoral Sul de SP'],
        rows: [
          [
            '**Sul do Brasil**',
            'Chuva acima da média (out–dez) com risco de cheias, que diminui até dezembro',
            'Maior descarga do Rio Ribeira e atenção para enchentes no Vale do Ribeira',
          ],
          [
            '**Sudeste (parte)**',
            'Episódios de chuva volumosa alternados com períodos mais secos',
            'Pragueiras fortes no verão, com dias de sol entre as pancadas',
          ],
          [
            '**Temperatura**',
            'Acima da faixa normal em quase todo o país; mais ondas de calor',
            'Ar e água do mar mais quentes; noites tropicais mesmo no fim do inverno',
          ],
          [
            '**Centro-norte do país**',
            'Seca acentuada e maior risco de incêndios florestais',
            'Sem impacto direto na costa — mas atenção à rota de estrada em dias de fumaça e calor',
          ],
        ],
      },
      { type: 'h2', text: 'El Niño vs. La Niña: o Que Muda no Litoral Sul' },
      {
        type: 'table',
        headers: ['Parâmetro', 'El Niño (cenário 2026/2027)', 'La Niña (contraponto)'],
        rows: [
          ['**Chuva no Sul/Sudeste Sul**', 'Acima da média, com eventos intensos e risco de cheias', 'Tendência a chuvas abaixo da média e verões mais secos'],
          ['**Temperatura**', 'Acima da média; ondas de calor mais frequentes', 'Menos anomalias térmicas; friagem mais recorrente no inverno'],
          ['**Rio Ribeira**', 'Descarga maior: mais sedimento e turbidez no estuário', 'Descarga menor; águas mais claras no Lagamar'],
          ['**Estradas e acesso**', 'Maior risco de deslizamento e alagamento em dias de chuva forte', 'Menor incidência de eventos críticos de chuva'],
        ],
      },
      { type: 'h2', text: 'Como o El Niño Afeta o Mar e o Surf' },
      {
        type: 'p',
        text:
          'Ser sincero: **El Niño não decide o mar de amanhã** — altura, período e direção das ondas dependem de sistemas de vento e do swell do dia, que você confere em **/swell?tab=forecast**. O que a temporada altera é o *contexto*: mais chuva significa mais descarga de rios (com mudanças na claridade da água no estuário), mar mais quente pode mudar a fauna e a temperatura de superfície, e o padrão de ventos pode variar ao longo do verão. O surfista atento cruza a previsão de longo prazo com a telemetria do dia.',
      },
      { type: 'h2', text: 'Checklist de Preparação para a Temporada' },
      {
        type: 'ul',
        items: [
          '**Cadastre-se na Defesa Civil:** envie o CEP por SMS para 40199 ou pelo WhatsApp (61) 2034-4611 e Telegram (@defesacivilbrbot) para receber alertas.',
          '**Avisos do INMET:** acompanhe os avisos meteorológicos oficiais em avisos.inmet.gov.br antes de viagens longas.',
          '**Rodovias:** em dias de chuva forte, confira SP-222, BR-116 e o status das balsas em /noticias#rodovias antes de sair.',
          '**Rio e estuário:** pescadores e navegadores devem atenção redobrada em dias de chuva no Vale do Ribeira — correnteza e turbidez sobem rápido.',
          '**Rotina diária:** /meteorologia para chuva e temperatura das 4 cidades e /swell?tab=forecast para mar, vento e marés.',
        ],
      },
      {
        type: 'callout',
        tone: 'alert',
        title: 'Cheias não seguem calendário',
        text:
          'O El Niño define a tendência sazonal, não o dia exato. Chuva extrema pode acontecer em qualquer período — cadastro na Defesa Civil e monitoramento diário são a sua rede de segurança.',
      },
      { type: 'h2', text: 'Até Quando o El Niño Vai Durar' },
      {
        type: 'p',
        text:
          'Os modelos indicam **probabilidade acima de 90% de persistência até pelo menos o início de 2027**, com alta probabilidade de El Niño muito forte entre a primavera e o verão de 2026 (ano hidrológico que vai até meados de 2027). O Painel El Niño continua emitindo boletins mensais — a recomendação oficial é o acompanhamento contínuo das condições meteorológicas, hidrológicas e geológicas e dos alertas dos órgãos competentes.',
      },
    ],
    faq: [
      {
        q: 'O que o El Niño significa para o litoral de São Paulo em 2026?',
        a: 'A tendência para o Litoral Sul de SP e o Vale do Ribeira é de chuva acima da média, temperaturas acima do normal e maior risco de cheias e deslizamentos, sobretudo no verão. Mais chuva significa maior descarga do Rio Ribeira no estuário — com efeitos na claridade da água e na navegação — e mais episódios de temporal na orla.',
      },
      {
        q: 'O El Niño de 2026 vai ser o mais forte da história?',
        a: 'O Painel El Niño projeta 95% de chance de intensidade muito forte entre outubro e dezembro de 2026, o que pode ser o fenômeno mais intenso desde 1950. Em outubro de 2026, a anomalia mensal chegou a +2,47 °C, recorde da série histórica para o mês, segundo o INMET.',
      },
      {
        q: 'El Niño afeta as ondas e o surf no Litoral Sul?',
        a: 'Não diretamente: altura, período e direção das ondas dependem do swell e do vento de cada dia, que você confere em /swell?tab=forecast. O El Niño muda o contexto da temporada — chuva, temperatura da água, descarga dos rios e padrão de ventos —, mas a call do dia continua sendo a telemetria em tempo real.',
      },
      {
        q: 'Até quando o El Niño deve durar?',
        a: 'Os modelos indicam probabilidade acima de 90% de o fenômeno persistir pelo menos até o início de 2027, com o pico entre outubro e dezembro de 2026. O Painel El Niño — INMET, INPE, ANA, CEMADEN, SGB, SEDEC e CENSIPAM — publica boletins mensais com o monitoramento atualizado.',
      },
    ],
    relatedLinks: [
      { label: 'Previsão do tempo (4 cidades)', href: '/meteorologia' },
      { label: 'Condições do mar e próximas marés', href: '/swell?tab=forecast' },
      { label: 'Alertas, rodovias e balsas', href: '/noticias#rodovias' },
      { label: 'Dinâmica costeira do Vale do Ribeira', href: '/blog/dinamica-costeira-vale-do-ribeira' },
    ],
    keywords: [
      'el niño 2026',
      'el niño 2026 brasil impactos',
      'chuva acima da média litoral sul sp',
      'el niño e o tempo em são paulo',
      'clima verão 2026 2027 vale do ribeira',
      'el niño mais forte desde 1950',
    ],
  },
  {
    slug: 'baleias-jubarte-litoral-sao-paulo',
    title: 'Baleias Jubarte no Litoral de São Paulo: Temporada, Regras e Onde Ver',
    metaTitle: 'Baleias Jubarte no Litoral Paulista | Meteor',
    description:
      'Temporada de baleias jubarte em SP vai de maio a novembro. Veja os avisos de 2026, as regras dos 100 metros do Ibama e onde observar no mar com segurança.',
    summary:
      'Calendário da migração, as regras dos 100 metros do Ibama e onde avistar jubartes no litoral paulista — do Litoral Norte ao trânsito do Sul.',
    category: 'Meio Ambiente',
    categoryColor: 'bg-green-500/20 text-green-400',
    date: '2026-11-07',
    readTime: '6 min de leitura',
    imageUrl: '/blog/baleias-jubarte.jpg',
    imageAlt: 'Baleia jubarte saltando no oceano cinza-esverdeado durante a migração pelo litoral de São Paulo',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'A **baleia-jubarte** migra todos os anos pelas águas brasileiras: a temporada no litoral de São Paulo começa em **maio**, ganha força a **partir de junho** e segue até **novembro**, quando os animais deixam as áreas de reprodução no Atlântico tropical em direção ao sul. Em 2026, o Litoral Norte de SP **já havia registrado 14 avistamentos até 8 de maio** — temporada adiantada. Pela **portaria do Ibama**, qualquer embarcação deve manter **distância mínima de 100 metros**, aproximação sempre **lateral**, **motor no neutro** se o animal chegar perto e **zero perseguição**. No **Litoral Sul de SP** (Ilha Comprida, Cananéia, Juréia) os avistamentos são mais esporádicos — os animais estão em trânsito — e o passeio seguro é com agência credenciada.',
      },
      { type: 'h2', text: 'Calendário da Migração em São Paulo' },
      {
        type: 'table',
        headers: ['Período', 'O que acontece', 'Onde observar'],
        rows: [
          [
            '**Maio**',
            'Chegada dos primeiros animais ao litoral paulista — em 2026, temporada começou antes do previsto',
            'Litoral Norte: Ubatuba, Ilhabela e Bertioga',
          ],
          [
            '**Junho a agosto**',
            'Pico da migração ao longo da costa; alta demanda pelos passeios de observação',
            'Litoral Norte e central (Santos, Guarujá)',
          ],
          [
            '**Setembro a novembro**',
            'Animais em trânsito de volta para as águas frias do sul; avistamentos mais pontuais',
            'Toda a costa paulista, com registros esparsos no Litoral Sul',
          ],
          [
            '**Dezembro a março**',
            'Fase de reprodução e criação no Atlântico tropical (Nordeste/Abrolhos); fora da janela paulista',
            'Litoral da Bahia',
          ],
        ],
      },
      { type: 'h2', text: 'As Regras do Ibama para Observação (Portaria)' },
      {
        type: 'ul',
        items: [
          '**Distância mínima de 100 metros** entre a embarcação e as baleias (e golfinhos).',
          '**Aproximação sempre lateral** — nunca pela frente nem atrás, para não interromper o trajeto.',
          '**Nunca perseguir** nem cercar os animais; se eles se aproximarem por curiosidade, **motor no neutro**.',
          '**Sem barulho excessivo:** baleias e golfinhos se comunicam pelo som e precisam saber onde está a embarcação.',
          '**Não interagir:** nada de nadar junto, tocar ou alimentar os animais.',
          '**Agência credenciada:** em Ilhabela, o selo **"Amigo das Baleias"** identifica operadores capacitados.',
        ],
      },
      {
        type: 'callout',
        tone: 'alert',
        title: '100 metros não é sugestão',
        text:
          'A regra da portaria do Ibama vale para qualquer embarcação, inclusive particulares. A aproximação indevida colide o animal, o turista e o operador — e tira o aval de quem faz o passeio certo.',
      },
      { type: 'h2', text: 'Onde Ver no Litoral Sul de SP' },
      {
        type: 'p',
        text:
          'A concentração de avistamentos em São Paulo está no **Litoral Norte** (Ubatuba, Ilhabela, Bertioga), onde a temporada de 2026 começou antes do previsto. No **Litoral Sul** — Ilha Comprida, Cananéia, Iguape e Juréia — a jubarte aparece de forma **esporádica, em trânsito**: a janela é pequena e depende de sorte, de mar calmo e de olhar atento para o horizonte. Quem está no Mar de Dentro, em geral, conta com os **golfinhos-cinza** (Sotalia guianensis), que acompanhavam os barcos o ano todo — um dos grandes encantos do estuário de Cananéia.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Combine mar + vento antes de sair',
        text:
          'Passeio de observação pede mar manso e pouca rajada: confira /swell?tab=forecast (altura e vento) e /meteorologia (chuva e temperatura) antes de fechar o passeio.',
      },
      { type: 'h2', text: 'Ficha Rápida da Baleia-Jubarte' },
      {
        type: 'table',
        headers: ['Característica', 'Informação'],
        rows: [
          ['**Nome científico**', '*Megaptera novaeangliae*'],
          ['**Tamanho**', 'Até cerca de 16 metros de comprimento'],
          ['**Migração**', 'Uma das maiores do reino animal: milhares de quilômetros entre as águas polares de alimentação e as tropicais de reprodução'],
          ['**Alimentação**', 'Krill e pequenos peixes nas águas frias do sul'],
          ['**Reprodução**', 'Tropicais — filhotes nascem e crescem em águas quentes antes da volta para o sul'],
          ['**Som**', 'Os machos emitem os cantos característicos da época acasalamento'],
        ],
      },
      { type: 'h2', text: 'Como Acompanhar a Temporada' },
      {
        type: 'p',
        text:
          'Projeções e notícias de avistamento aparecem em **/noticias**, e as condições de mar e vento para sair na água estão em **/swell?tab=forecast**. Se o seu plano é viajar pela região, cruze a previsão com o status das rodovias em **/noticias#rodovias**.',
      },
    ],
    faq: [
      {
        q: 'Quando começa a temporada de baleias jubarte em São Paulo?',
        a: 'A temporada começa em maio e ganha força a partir de junho, seguindo até novembro. Em 2026, o Litoral Norte de SP registrou 14 avistamentos até 8 de maio — os animais chegaram antes do início oficial, segundo o Projeto Baleia Jubarte.',
      },
      {
        q: 'Qual a distância mínima legal para observar baleias?',
        a: 'Pela portaria do Ibama, a distância mínima é de 100 metros entre a embarcação e os animais. A aproximação deve ser sempre lateral, sem perseguição ou interrupção do trajeto, e se os animais se aproximarem por curiosidade o motor deve ficar no neutro. Barulho excessivo também é proibido.',
      },
      {
        q: 'Onde ver baleias jubarte no litoral de São Paulo?',
        a: 'Os principais pontos ficam no Litoral Norte — Ubatuba, Ilhabela e Bertioga, com registros também em Santos e no litoral central. Em Ilhabela, o selo "Amigo das Baleias" identifica agências credenciadas para os passeios de observação.',
      },
      {
        q: 'Dá para ver baleias no Litoral Sul, em Ilha Comprida e Cananéia?',
        a: 'Sim, mas de forma esporádica: no Litoral Sul as jubartes estão em trânsito e os avistamentos são pontuais, dependentes de mar calmo e de olhar atento. Quem navega no Mar de Dentro, em geral, encontra os golfinhos-cinza, que acompanham os barcos no estuário o ano todo.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar e vento', href: '/swell?tab=forecast' },
      { label: 'Previsão do tempo (4 cidades)', href: '/meteorologia' },
      { label: 'Notícias e avistamentos', href: '/noticias' },
      { label: 'Roteiros e parceiros locais', href: '/comercio' },
      { label: 'Reserva de Cananéia e manguezais', href: '/blog/reserva-de-cananeia-manguezais-lagamar' },
    ],
    keywords: [
      'baleia jubarte são paulo',
      'temporada de baleias litoral paulista',
      'avistamento de baleias jubarte 2026',
      'regras ibama baleias 100 metros',
      'migração de baleias no brasil',
      'onde ver baleias em são paulo',
    ],
  },
  {
    slug: 'ilha-do-cardoso-guia-ecoturismo',
    title: 'Ilha do Cardoso: Guia Completo de Ecoturismo em Cananéia',
    metaTitle: 'Ilha do Cardoso: Guia de Ecoturismo | Meteor 2.0',
    description:
      'Guia da Ilha do Cardoso em Cananéia: acesso de barco, núcleos Perequê e Marujá, trilhas, horário de visita e todas as dicas para montar o roteiro completo.',
    summary:
      'Tudo para planejar uma visita ao Parque Estadual da Ilha do Cardoso: como chegar de barco, os dois núcleos abertos, trilhas e regras do parque.',
    category: 'Ecoturismo',
    categoryColor: 'bg-teal-500/20 text-teal-400',
    date: '2026-11-07',
    readTime: '8 min de leitura',
    imageUrl: '/blog/ilha-do-cardoso.jpg',
    imageAlt: 'Praia quase deserta e mata atlântica preservada na Ilha do Cardoso, em Cananéia, no Vale do Ribeira',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'A **Ilha do Cardoso** é um Parque Estadual de **13,6 mil hectares** no extremo sul de São Paulo, no município de **Cananéia**, a cerca de **245 km da capital** — e mais perto de **Curitiba (138 km)** do que de São Paulo. O arquipélago tem três núcleos — **Perequê, Marujá e Ilha da Casca** —, mas só **Perequê e Marujá recebem visitantes**, e **carros são proibidos na ilha**: o acesso é sempre de **barco**, a partir de Cananéia, Iguape ou Ilha Comprida. A visitação é **gratuita e sem agendamento prévio**, com horário de **quinta a domingo, das 9h às 17h** (confirme com o parque antes de sair) e trilhas como a da **Cachoeira Grande** (queda de 11 m) e a do **Morro das Almas** (2 km, cerca de 3 horas).',
      },
      { type: 'h2', text: 'Onde Fica e Como Chegar' },
      {
        type: 'p',
        text:
          'A ilha fica no Vale do Ribeira, banhada a leste pelo Atlântico, a oeste pelo Canal de Ararapira e ao norte pela Baía de Trapandé. Não existe estrada até os núcleos: o roteiro combina transporte terrestre até Cananéia (ou até Cubatão) e o transfer de barco — a viagem de barco já faz parte da experiência, com chance de avistar golfinhos logo na chegada.',
      },
      {
        type: 'table',
        headers: ['Etapa', 'Rota', 'Observação'],
        rows: [
          ['**1ª**', 'Até Cananéia (ou Cubatão, com balsa para Cananéia)', 'De carro ou ônibus; de São Paulo a Cubatão são cerca de 3h30 de ônibus'],
          ['**2ª**', 'Transfer de barco até os núcleos do parque', 'Saídas de Cananéia, Iguape ou Ilha Comprida — confira disponibilidade com as empresas locais'],
          ['**3ª**', 'Chegada ao Núcleo Perequê ou Marujá', 'Sede do parque e principais estruturas de recepção'],
        ],
      },
      {
        type: 'callout',
        tone: 'alert',
        title: 'Confirme barco e visitação antes de sair',
        text:
          'Horários de barco e de visitação do parque podem mudar. Ligue para o parque: (13) 3851-1163 / (13) 3851-1108 — e acompanhe o status das rodovias e travessias em /noticias#rodovias.',
      },
      { type: 'h2', text: 'Os Três Núcleos do Parque' },
      {
        type: 'table',
        headers: ['Núcleo', 'Recebe visitante?', 'Destaques'],
        rows: [
          [
            '**Perequê**',
            'Sim — sede do parque',
            'Inaugurado em 2010, explica a história da ilha com painéis e objetos; caiaque monitorado no Rio Perequê; avistamento de botos-cinza; porta de entrada das trilhas',
          ],
          [
            '**Marujá**',
            'Sim',
            'Melhor estrutura de hospedagem: casas típicas caiçaras, restaurantes e pousadas; Praia do Marujá; bicicleta até o Pontal do Leste (18 km de litoral)',
          ],
          [
            '**Ilha da Casca**',
            'Não',
            'Base de apoio e fiscalização do Parque Estadual da Ilha do Cardoso',
          ],
        ],
      },
      { type: 'h2', text: 'Trilhas: o Que Fazer a Pé' },
      {
        type: 'ul',
        items: [
          '**Trilha da Cachoeira Grande:** uma das mais procuradas; queda d\'água de mais de 11 metros, com acesso por trilha de dificuldade moderada ou de barco.',
          '**Trilha do Morro das Almas:** 2 km, cerca de 3 horas, nível moderado — aves, bromélias e mata nativa.',
          '**Trilha do Poço das Antas:** 2,5 km e cerca de 4 horas, com margens do Rio Perequê, piscinas naturais e transição de restinga, floresta de encosta e mata de planície.',
          '**Trilha do Mangueal:** sai do Núcleo Perequê até a Praia da Pereirinha, passando por mata nativa e bancos de caranguejo.',
          '**Trilha do Sambaqui e do Costão Rochoso:** menos de 2 horas, nível médio — sítios arqueológicos com ossos e objetos dos antigos habitantes da ilha.',
        ],
      },
      { type: 'h2', text: 'Praias e Atrativos Imperdíveis' },
      {
        type: 'ul',
        items: [
          '**Praia do Pereirinha (Itacuruçá):** a mais próxima de Cananéia e considerada uma das melhores para crianças — e um dos pontos de mergulho com golfinhos.',
          '**Praia de Ipanema:** a partir do Perequê, spot de surf e golfinhos saltando na orla.',
          '**Praia do Marujá:** faixa extensa e quase deserta, "tesouro escondido" da ilha.',
          '**Pontal do Leste:** 18 km de litoral do Marujá até o pontal — ideal de bicicleta (carros são proibidos).',
          '**Marco do Tratado de Tordesilhas:** em Itacuruçá, a linha imaginária que dividia América portuguesa e espanhola passava bem sobre a ilha.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Turismo comunitário que sustenta a ilha',
        text:
          'Hospedagem e alimentação no Marujá e no Perequê são das famílias caiçaras: consumir serviços locais é o que mantém a floresta de pé. A reserva faz parte da Reserva da Biosfera reconhecida pela Unesco no Vale do Ribeira.',
      },
      { type: 'h2', text: 'Regras e Cuidados na Visitação' },
      {
        type: 'ul',
        items: [
          '**Carros proibidos** na ilha: desloque-se a pé ou de bicicleta.',
          '**Siga apenas as trilhas oficiais** e respeite os horários de visitação do parque.',
          '**Leve água, repelente e protetor solar** — a estrutura nos núcleos é limitada.',
          '**Zero resíduo:** leve todo o seu lixo; a ilha não tem tratamento como a cidade.',
          '**Respeite a fauna:** não alimente animais, não aproxime dos golfinhos e mantenha distância.',
          '**Consulte o parque** ((13) 3851-1163 / (13) 3851-1108) para horários de barco, visitação e trilhas fechadas.',
        ],
      },
      { type: 'h2', text: 'Melhor Época e Telemetria para o Roteiro' },
      {
        type: 'p',
        text:
          'A ilha recebe visitantes de quinta a domingo ao longo do ano — o fator decisivo é o **tempo**: chuva forte deixa as trilhas escorregadias e o barco mais desconfortável. Cruze **/meteorologia** (chuva e temperatura das 4 cidades), **/swell?tab=forecast** (mar e vento para a travessia) e **/noticias#rodovias** (acesso até Cananéia) antes de fechar o roteiro.',
      },
    ],
    faq: [
      {
        q: 'Como chegar à Ilha do Cardoso?',
        a: 'Não há estrada até os núcleos: o acesso é de barco a partir de Cananéia, Iguape ou Ilha Comprida. De São Paulo, a rota comum é até Cubatão (cerca de 3h30 de ônibus) e balsa até Cananéia, seguida do transfer de barco. Na ilha, carros são proibidos — o deslocamento é a pé ou de bicicleta.',
      },
      {
        q: 'Quanto custa e qual o horário de visita do Parque Estadual da Ilha do Cardoso?',
        a: 'A visitação é gratuita e não exige agendamento prévio, de quinta a domingo, das 9h às 17h (horário informado por guias oficiais — confirme com o parque antes de sair). O acesso depende do transfer de barco, cujo valor é cobrado pelas empresas de transporte.',
      },
      {
        q: 'Quais trilhas fazer na Ilha do Cardoso?',
        a: 'As mais procuradas são a da Cachoeira Grande (queda de mais de 11 metros, acesso moderado ou de barco), do Morro das Almas (2 km, cerca de 3 horas), do Poço das Antas (2,5 km, cerca de 4 horas, com piscinas naturais), do Mangueal (Perequê até a Praia da Pereirinha) e do Sambaqui e Costão Rochoso (menos de 2 horas, com sítios arqueológicos).',
      },
      {
        q: 'Dá para surfar e nadar com golfinhos na Ilha do Cardoso?',
        a: 'Sim. A Praia de Ipanema, acessível a partir do Núcleo Perequê, é apontada pelos surfistas da região, e o mergulho com golfinhos acontece com mais frequência perto de Itacuruçá e da Praia do Pereirinha — os animais costumam acompanhar os barcos na chegada à ilha. Confira mar e vento em /swell?tab=forecast antes.',
      },
    ],
    relatedLinks: [
      { label: 'Condições do mar e próximas marés', href: '/swell?tab=forecast' },
      { label: 'Previsão do tempo da região', href: '/meteorologia' },
      { label: 'Reserva de Cananéia e manguezais', href: '/blog/reserva-de-cananeia-manguezais-lagamar' },
      { label: 'Status das rodovias e travessias', href: '/noticias#rodovias' },
      { label: 'Roteiros e parceiros locais', href: '/comercio' },
    ],
    keywords: [
      'ilha do cardoso',
      'parque estadual ilha do cardoso trilhas',
      'como chegar ilha do cardoso cananéia',
      'ecoturismo vale do ribeira',
      'núcleo perequê e marujá',
      'ilha do cardoso onde ficar',
    ],
  },
  {
    slug: 'caverna-do-diabo-guia-visita',
    title: 'Caverna do Diabo: Guia de Visita em Eldorado, Vale do Ribeira',
    metaTitle: 'Caverna do Diabo: Guia de Visita em Eldorado',
    description:
      'Guia completo da Caverna do Diabo em Eldorado: como chegar, preço 2026, monitoria AMAMEL, horários e as principais trilhas do parque no Vale do Ribeira.',
    summary:
      'A maior caverna de São Paulo em detalhes: rota pela BR-116, ingresso e monitoria, grupos de 12 pessoas e o que fazer além da caverna.',
    category: 'Ecoturismo',
    categoryColor: 'bg-teal-500/20 text-teal-400',
    date: '2026-11-07',
    readTime: '7 min de leitura',
    imageUrl: '/blog/caverna-do-diabo.jpg',
    imageAlt: 'Formações rochosas iluminadas e passarelas no interior da Caverna do Diabo, em Eldorado, SP',
    author: 'Carlos Alexandre',
    status: 'published',
    content: [
      {
        type: 'answer',
        text:
          'A **Caverna do Diabo**, em **Eldorado (SP)**, é a maior caverna do estado: mais de **6.000 metros de galerias**, com cerca de **600 metros abertos à visitação** em **grupos de 12 pessoas** e **1 hora de duração**, sempre acompanhada de monitor. Ela fica no **Parque Estadual Caverna do Diabo** (criado em 2008, com mais de 40 mil hectares no mosaico de conservação de Jacupiranga), a **292 km de São Paulo** — cerca de **4h30 pela BR-116 (Régis Bittencourt) até o km 446 e depois a SP-165 no km 111**. O ingresso custa **R$ 19** (gratuito para crianças até 12 anos, adultos 60+ e pessoas com deficiência; estudantes pagam meia) e a **monitoria ambiental da AMAMEL é obrigatória**: R$ 18 em dinheiro ou R$ 20 no cartão. A abertura é de **terça a domingo, das 8h às 17h** — monitores credenciados no local, **sem agendamento prévio**.',
      },
      { type: 'h2', text: 'Ficha Técnica do Parque' },
      {
        type: 'table',
        headers: ['Item', 'Informação'],
        rows: [
          ['**Criação**', 'Parque Estadual Caverna do Diabo (PECD), em 2008 — integra o mosaico de unidades de conservação de Jacupiranga'],
          ['**Área**', 'Mais de 40.000 hectares, abrangendo Barra do Turvo, Cajati, Eldorado e Iporanga'],
          ['**Caverna**', 'Mais de 6.000 m de galerias (cerca de 6.340 m topografados), com ~600 m abertos à visita'],
          ['**Acesso**', 'BR-116 (Régis Bittencourt) até o km 446 → SP-165, km 111 (bairro André Lopes), na Serra do André Lopes'],
          ['**Distância**', '292 km de São Paulo (~4h30) e 255 km de Curitiba (~4h)'],
          ['**Atendimento**', 'Terça a domingo, das 8h às 17h (última visita às 17h); segunda aberta em feriados e férias escolares'],
        ],
      },
      { type: 'h2', text: 'Quanto Custa (2026)' },
      {
        type: 'table',
        headers: ['Item', 'Valor'],
        rows: [
          ['**Ingresso**', 'R$ 19 — meia-entrada para estudantes (R$ 9,50)'],
          ['**Isenções**', 'Crianças até 12 anos, adultos 60+ e pessoas com deficiência não pagam'],
          ['**Monitoria AMAMEL (obrigatória)**', 'R$ 18 em dinheiro ou R$ 20 no cartão, por pessoa'],
          ['**Compra**', 'Site oficial de ingressos do parque; monitores credenciados ficam no próprio parque'],
        ],
      },
      {
        type: 'callout',
        tone: 'alert',
        title: 'Valores podem mudar',
        text:
          'Os preços acima são os praticados em 2026 — confirme ingresso, monitoria e horários com o parque: (13) 3871-1242 / (13) 3871-3318, antes de sair de casa.',
      },
      { type: 'h2', text: 'Como é a Visita à Caverna' },
      {
        type: 'p',
        text:
          'A visita acontece em **grupos de 12 pessoas** e dura cerca de **1 hora**, sempre com monitor. Você desce escadarias e atravessa passarelas e pontes até o **"Cathedral Hall"**, o grande salão com formações batizadas de **Guardião, Branca de Neve, Três Reis e Caldeirão do Diabo** — todas esculpidas por milhões de anos de gotejamento. Cada visitante preenche ficha de entrada e saída, controle que ajuda o parque a distribuir os grupos.',
      },
      { type: 'h2', text: 'O que Fazer Além da Caverna' },
      {
        type: 'ul',
        items: [
          '**Trilha do Araçá:** autoguiada e de fácil acesso, sai de perto da entrada da caverna e leva a três belas quedas d\'água.',
          '**Mirante do Governador:** cruza floresta e campo de altitude até o mirante com vista para o **Vale do Ribeira**.',
          '**Queda do Meu Deus:** eleita a mais bonita do estado — e o roteiro quilombola passa por ela.',
          '**Mirante do Cruzeiro e Vale das Ostras:** outros pontos do parque com paisagem e história local.',
          '**Circuito Quilombola:** passeio por comunidades remanescentes de quilombos em Eldorado, com atrativos naturais e culturais.',
          '**Cachoeira do Sapatu e cavernas do Rolado e Frias:** complementos para quem fica mais de um dia na região.',
        ],
      },
      { type: 'h2', text: 'Caverna do Diabo x PETAR: São Parques Diferentes' },
      {
        type: 'p',
        text:
          'Sim, confusão comum: a **Caverna do Diabo não faz parte do PETAR**. São parques vizinhos e distintos — o PECD fica em **Eldorado** e o PETAR em **Iporanga** —, ambos administrados pela Fundação Florestal. A separação faz parte do plano de manejo e ajuda no controle de visitantes e na distribuição dos monitores locais.',
      },
      { type: 'h2', text: 'Como Chegar' },
      {
        type: 'table',
        headers: ['Origem', 'Rota', 'Distância e tempo'],
        rows: [
          ['**São Paulo (SP)**', 'BR-116 até o km 446 → SP-165 (acesso por Jacupiranga ou Eldorado), km 111', '292 km — cerca de 4h30'],
          ['**Curitiba (PR)**', 'BR-116 até o km 477 → SP-165, km 111', '255 km — cerca de 4h'],
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Cruze o clima antes de rolar',
        text:
          'Eldorado fica no Vale do Ribeira, onde chuva forte afeta estradas e o nível dos rios. Confira /meteorologia (chuva), /swell?tab=forecast (condições da região) e /noticias#rodovias (SP-222 e BR-116) antes de sair.',
      },
    ],
    faq: [
      {
        q: 'Como funciona a visita à Caverna do Diabo?',
        a: 'A visita é em grupos de 12 pessoas, sempre com monitor, e dura cerca de 1 hora. São cerca de 600 metros abertos da caverna, com escadarias, passarelas e pontes até o "Cathedral Hall". O visitante preenche ficha de entrada e saída — controle do parque. Não há agendamento prévio: monitores credenciados ficam disponíveis no local.',
      },
      {
        q: 'Quanto custa entrar na Caverna do Diabo em 2026?',
        a: 'O ingresso do parque custa R$ 19 (meia-entrada R$ 9,50 para estudantes; gratuito para crianças até 12 anos, adultos 60+ e pessoas com deficiência). Somam-se a monitoria ambiental obrigatória da AMAMEL: R$ 18 em dinheiro ou R$ 20 no cartão por pessoa. Confirme os valores com o parque: (13) 3871-1242.',
      },
      {
        q: 'Precisa agendar para visitar a Caverna do Diabo?',
        a: 'Não: os monitores credenciados ficam disponíveis nas dependências do parque e não é necessário agendamento prévio. O atendimento é de terça a domingo, das 8h às 17h (última visita às 17h), com abertura às segundas-feiras em feriados e nas férias escolares (segunda quinzena de dezembro, janeiro e julho).',
      },
      {
        q: 'A Caverna do Diabo é a mesma coisa que o PETAR?',
        a: 'Não. São parques distintos e vizinhos: o Parque Estadual Caverna do Diabo fica em Eldorado e o PETAR (Parque Estadual Turístico do Alto Ribeira) em Iporanga. Ambos pertencem à Fundação Florestal e fazem parte do mosaico de conservação do Vale do Ribeira, mas têm entradas, estruturas e regras próprias.',
      },
    ],
    relatedLinks: [
      { label: 'Previsão do tempo da região', href: '/meteorologia' },
      { label: 'Status das rodovias (SP-222 e BR-116)', href: '/noticias#rodovias' },
      { label: 'Roteiros e parceiros locais', href: '/comercio' },
      { label: 'Dinâmica costeira do Vale do Ribeira', href: '/blog/dinamica-costeira-vale-do-ribeira' },
      { label: 'Todos os artigos do blog', href: '/blog' },
    ],
    keywords: [
      'caverna do diabo eldorado',
      'como visitar a caverna do diabo',
      'parque estadual caverna do diabo preço',
      'caverna do diabo x petar',
      'atrativos do vale do ribeira',
      'trilha do araca mirante do governador',
    ],
  },
  {
    slug: 'surf-peruibe-spots-guia',
    title: 'Surf em Peruíbe: Spots e Condições',
    metaTitle: 'Surf em Peruíbe: Spots e Condições | Meteor',
    description:
      'Guia dos spots de surf em Peruíbe: níveis de experiência de cada pico, melhor maré e vento, e como consultar as condições do mar antes de entrar na água.',
    summary:
      'Os principais spots de surf de Peruíbe e o que observar de maré, vento e swell antes de entrar na água.',
    category: 'Ecoturismo',
    categoryColor: 'bg-teal-500/20 text-teal-400',
    date: '2026-11-07',
    readTime: '5 min de leitura',
    imageUrl: '/blog/surf-peruibe.jpg',
    imageAlt: 'Surfista na queda de onda na praia de mar aberto de Peruíbe sob luz dourada do fim de tarde',
    author: 'Carlos Alexandre',
    status: 'coming-soon',
    content: [],
    relatedLinks: [
      { label: 'Spots e níveis de experiência', href: '/swell?tab=spots' },
      { label: 'Condições do mar', href: '/swell?tab=forecast' },
    ],
    keywords: ['surf peruíbe', 'spots de surf peruíbe sp', 'previsão de surf peruíbe'],
  },
  {
    slug: 'golfinhos-cinza-lagamar',
    title: 'Golfinhos-cinza do Lagamar',
    metaTitle: 'Golfinhos-cinza do Lagamar | Meteor 2.0',
    description:
      'Onde avistar golfinhos-cinza no estuário de Cananéia e Ilha Comprida: melhor horário, comportamento do grupo e como observar sem perturbar os animais.',
    summary:
      'O Sotalia guianensis é o morador mais simpático do Mar de Dentro: onde, quando e como observar os golfinhos do Lagamar.',
    category: 'Meio Ambiente',
    categoryColor: 'bg-green-500/20 text-green-400',
    date: '2026-11-07',
    readTime: '5 min de leitura',
    imageUrl: '/blog/golfinhos-lagamar.jpg',
    imageAlt: 'Grupo de golfinhos-cinza superfície em canal do manguezal do Lagamar ao amanhecer',
    author: 'Carlos Alexandre',
    status: 'coming-soon',
    content: [],
    relatedLinks: [
      { label: 'Condições do mar e marés', href: '/swell?tab=forecast' },
      { label: 'Reserva de Cananéia e manguezais', href: '/blog/reserva-de-cananeia-manguezais-lagamar' },
    ],
    keywords: ['golfinho cinza lagamar', 'golfinhos cananéia', 'sotalia guianensis litoral sul'],
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
