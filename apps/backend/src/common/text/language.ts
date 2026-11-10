/**
 * Filtro de idioma para os feeds de noticias.
 *
 * As queries do Google News usam `hl=pt-BR`, mas a busca casa o *conteudo*
 * do artigo e nao o idioma — por isso manchetes em ingles ou espanhol ainda
 * aparecem no feed. Este filtro mantem apenas o que e de fato portugues.
 *
 * Heuristica: pontuacao por palavras de funcao (as mais frequentes de cada
 * idioma). Palavras exclusivas de um idioma pesam 1.0; palavras usadas tanto
 * em portugues quanto em espanhol/espanhol pesam 0.5 em ambos e cancelam.
 * O texto e portugues quando a pontuacao PT e a maior entre as tres.
 *
 * Sem nenhum marcador o item e mantido: preferimos conteudo relevante a
 * descartar por duvida.
 */

/** Pontuacao por palavra de funcao — exclusivo de um idioma. */
const PT_EXCLUSIVE = [
  'nao', 'com', 'pelo', 'pela', 'pelos', 'pelas', 'das', 'dos', 'numa', 'num', 'ja',
  'mais', 'muito', 'voce', 'voces', 'sao', 'foram', 'foi', 'eles', 'elas', 'nos',
  'entre', 'depois', 'mesmo', 'ate', 'apenas', 'ainda', 'onde', 'quando', 'porque',
  'assim', 'entao', 'aqui', 'ali', 'agora', 'seu', 'sua', 'seus', 'suas', 'meu',
  'minha', 'este', 'esta', 'isso', 'aquilo', 'quem', 'qual', 'quais', 'cada', 'todo',
  'toda', 'todos', 'todas', 'outro', 'outra', 'pode', 'podem', 'tem', 'ter', 'fazer',
  'vai', 'foi', 'estao', 'era', 'sera', 'disso', 'cerca', 'pra', 'pro', 'em', 'do',
  'da', 'no', 'na', 'nos', 'ao', 'aos', 'e', 'que', 'se', 'para', 'como', 'por',
  'ele', 'ela', 'algo', 'nada', 'sempre', 'nunca', 'tambem', 'so', 'muitos', 'varias',
  'durante', 'desde', 'sobre', 'contra', 'apos', 'antes', 'depois', 'perto', 'longe',
  'talvez', 'quase', 'metade', 'resto', 'mesma', 'mesmo', 'nenhum', 'nenhuma',
];

const EN_EXCLUSIVE = [
  'the', 'of', 'and', 'to', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for',
  'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or',
  'one', 'had', 'by', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your',
  'can', 'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
  'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'some',
  'her', 'would', 'make', 'like', 'into', 'time', 'has', 'look', 'two', 'more',
  'write', 'go', 'see', 'number', 'way', 'could', 'people', 'my', 'than', 'first',
  'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down',
  'day', 'did', 'get', 'come', 'made', 'may', 'part', 'after', 'before', 'between',
  'still', 'here', 'there', 'back', 'down', 'off', 'under', 'through', 'during',
  'over', 'world', 'crowned', 'wins', 'won', 'claimed', 'named', 'highlights',
  'athlete', 'athletes', 'forecast', 'sunrise', 'sunset', 'results', 'pipeline',
  'surfing', 'breaking', 'champion', 'championship', 'announce', 'announced',
  'confirm', 'confirmed', 'awaits', 'toward', 'surfer', 'surfers', 'waves', 'ocean',
];

const ES_EXCLUSIVE = [
  'el', 'la', 'los', 'las', 'del', 'una', 'unas', 'unos', 'sus', 'hacia', 'y',
  'con', 'muy', 'pero', 'cuando', 'sin', 'hasta', 'hay', 'donde', 'quien', 'uno',
  'ni', 'ese', 'eso', 'ellos', 'esto', 'otros', 'otras', 'otra', 'es', 'le',
  'cual', 'cuales', 'siendo', 'fueron', 'estan', 'gana', 'viene', 'clasificacion',
  'ademas', 'solo', 'segun', 'tras', 'hace', 'asi', 'tan', 'muy', 'entre', 'pais',
];

/** Conteudo em portugues — presente em pt, ausente em en/es. */
const PT_CONTENT = [
  'praia', 'praias', 'onda', 'ondas', 'oceano', 'vento', 'ventos', 'tempo', 'chuva',
  'chuvas', 'previsao', 'calor', 'quente', 'tempestade', 'alerta', 'aviso', 'rodovia',
  'rodovias', 'transito', 'acidente', 'colisao', 'vitima', 'delegacia', 'bombeiros',
  'escola', 'feira', 'corrida', 'ciclismo', 'prancha', 'camisa', 'bateria', 'tubo',
  'manobra', 'titulo', 'campeao', 'campeoes', 'vitoria', 'vitorias', 'etapa', 'etapas',
  'torcida', 'trilha', 'ilha', 'municipio', 'prefeitura', 'camara', 'eleitoral',
  'regiao', 'cidade', 'noticia', 'noticias', 'atual', 'ultimo', 'ultima', 'primeiro',
  'primeira', 'litoral', 'surfista', 'surfistas', 'surfe', 'praia', 'praias',
  'recebe', 'recebem', 'mostra', 'mostram', 'traz', 'revisao', 'apresenta', 'ocorre',
  'divulga', 'confirma', 'com', 'meteorologia', 'mar', 'sol', 'chove', 'nublado',
  'ensolarado', 'vendaval', 'maresia', 'corrente', 'banco', 'praia', 'servico',
  'restaurante', 'farmacia', 'padaria', 'hotel', 'pousada', 'acampamento', 'trilha',
  'cachoeira', 'cachoeiras', 'lago', 'dunas', 'mata', 'bioma', 'biodiversidade',
];

function toMap(words: string[], weight: number): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of words) map.set(w, weight);
  return map;
}

/**
 * Palavras compartilhadas por PT e ES: pesam 0.5 em ambos e se anulam.
 * Palavras compartilhadas por PT e EN entram como 0.5 em PT e 0.5 em EN.
 */
const SHARED_PT_ES = toMap(
  [
    'sobre', 'realiza', 'realizam', 'presenta', 'plan', 'estrategico', 'dia', 'dias',
    'final', 'finals', 'evento', 'eventos', 'title', 'point', 'points', 'heat', 'score',
    'series', 'open', 'mundial', 'report', 'reports', 'news', 'world', 'surf', 'wave',
    'waves', 'ranking', 'highlights', 'results', 'event', 'day', 'days', 'sunset',
    'sunrise', 'forecast', 'athlete', 'athletes', 'champion', 'championship', 'title',
    'entre', 'solo', 'meta', 'nivel', 'final', 'mundial',
  ],
  0.5
);

const SHARED_PT_EN = toMap(
  [
    'final', 'finals', 'event', 'events', 'series', 'open', 'mundial', 'report',
    'reports', 'news', 'world', 'surf', 'wave', 'waves', 'ranking', 'highlights',
    'results', 'day', 'days', 'sunset', 'sunrise', 'forecast', 'athlete', 'athletes',
    'champion', 'championship', 'point', 'points', 'score', 'heat', 'title',
  ],
  0.5
);

const PT_MAP = merge(toMap(PT_EXCLUSIVE, 1), toMap(PT_CONTENT, 1), SHARED_PT_ES, SHARED_PT_EN);
const EN_MAP = merge(toMap(EN_EXCLUSIVE, 1), SHARED_PT_EN);
const ES_MAP = merge(toMap(ES_EXCLUSIVE, 1), SHARED_PT_ES);

function merge(...maps: Map<string, number>[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const m of maps) {
    for (const [k, v] of m) out.set(k, (out.get(k) ?? 0) + v);
  }
  return out;
}

/** Remove acentos e normaliza para minusculas, mantendo apenas letras/numeros. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * true quando o texto parece estar em portugues.
 * Mantem o item quando nenhum marcador de idioma e encontrado.
 */
export function isPortuguese(text: string): boolean {
  const normalized = normalize(text);
  if (!normalized) return true;

  let pt = 0;
  let en = 0;
  let es = 0;

  for (const token of normalized.split(' ')) {
    pt += PT_MAP.get(token) ?? 0;
    en += EN_MAP.get(token) ?? 0;
    es += ES_MAP.get(token) ?? 0;
  }

  // Sem marcador nenhum: mantem (evita descartar conteudo relevante).
  if (pt === 0 && en === 0 && es === 0) return true;

  // Decisao pelo idioma com maior pontuacao; empate favorece PT.
  return pt >= en && pt >= es;
}

/**
 * Filtra uma lista de itens com titulo + descricao, mantendo os em portugues.
 * Aceita um seletor de texto para casos em que o campo relevante varia.
 */
export function filterPortuguese<T>(items: T[], getText: (item: T) => string): T[] {
  return items.filter(item => isPortuguese(getText(item)));
}
