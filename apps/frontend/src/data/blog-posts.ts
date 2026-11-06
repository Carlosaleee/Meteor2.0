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
