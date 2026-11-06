/**
 * Modelo de conteúdo do blog Meteor 2.0.
 *
 * O conteúdo é estruturado em blocos tipados (`BlogBlock`) em vez de
 * markdown/HTML cru — renderizador próprio em `components/blog/BlogContent.tsx`
 * (sem `dangerouslySetInnerHTML`, sem dependência de sanitização).
 */

export type BlogCategory =
  | 'Maré'
  | 'Clima'
  | 'Oceanografia'
  | 'Meio Ambiente'
  | 'Ecoturismo';

export type BlogCalloutTone = 'info' | 'tip' | 'alert';

export type BlogBlock =
  /** Resposta direta no início do artigo — o que os AI Overviews citam (GEO). */
  | { type: 'answer'; text: string }
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; tone: BlogCalloutTone; title?: string; text: string }
  | { type: 'quote'; text: string; cite?: string };

export type BlogFaqItem = {
  q: string;
  a: string;
};

export type BlogRelatedLink = {
  label: string;
  href: string;
};

export type BlogPostStatus = 'published' | 'coming-soon';

export type BlogPost = {
  slug: string;
  title: string;
  /** Title tag do SEO (≤ 60 caracteres) — o H1 pode ser mais longo que isso. */
  metaTitle: string;
  /** Meta description (150–160 caracteres). */
  description: string;
  /** Trecho exibido no card da listagem. */
  summary: string;
  category: BlogCategory;
  /** Classes Tailwind do badge (padrão por categoria). */
  categoryColor: string;
  /** Data ISO (YYYY-MM-DD) — usada como datePublished no JSON-LD. */
  date: string;
  readTime: string;
  /** Caminho em /public (ex.: /blog/tabua-de-mares.jpg). */
  imageUrl: string;
  imageAlt: string;
  author: string;
  status: BlogPostStatus;
  content: BlogBlock[];
  /** People Also Ask — renderizado como seção + JSON-LD FAQPage. */
  faq?: BlogFaqItem[];
  /** Apenas rotas reais do app (ver mapa de links do super-redator). */
  relatedLinks: BlogRelatedLink[];
  keywords: string[];
};

/** Badge por categoria (cores já usadas nos cards existentes do portal). */
export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  'Maré': 'bg-blue-500/20 text-blue-400',
  'Clima': 'bg-amber-500/20 text-amber-400',
  'Oceanografia': 'bg-emerald-500/20 text-emerald-400',
  'Meio Ambiente': 'bg-green-500/20 text-green-400',
  'Ecoturismo': 'bg-teal-500/20 text-teal-400',
};
