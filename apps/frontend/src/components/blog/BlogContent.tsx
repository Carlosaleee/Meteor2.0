import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BlogBlock, BlogCalloutTone, BlogPost } from '@/types/blog';

/** Rotas reais do app — qualquer match vira `<Link>` (nunca link morto). */
const ROUTE_SPLIT =
  /(\/(?:meteorologia|swell|noticias|comercio|blog|creditos)(?:\?[a-z=&]+)?(?:#[a-z-]+)?)/g;

function isRoute(segment: string): boolean {
  return /^\/(meteorologia|swell|noticias|comercio|blog|creditos)/.test(segment);
}

/** Converte rotas do texto em links internos. */
function linkify(text: string, key: string): ReactNode[] {
  return text
    .split(ROUTE_SPLIT)
    .filter(Boolean)
    .map((segment, i) =>
      isRoute(segment) ? (
        <Link
          key={`${key}-l${i}`}
          href={segment}
          className="text-blue-400 underline underline-offset-2 transition-colors hover:text-blue-300"
        >
          {segment}
        </Link>
      ) : (
        segment
      )
    );
}

/**
 * Inline mínimo e seguro: `**negrito**` → `<strong>`, rotas → `<Link>`.
 * Sem `dangerouslySetInnerHTML` — o conteúdo é renderizado como React nodes.
 */
function renderInline(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  text.split(/\*\*([^*]+)\*\*/g).forEach((part, i) => {
    if (!part) return;
    if (i % 2 === 1) {
      nodes.push(<strong key={`${key}-b${i}`}>{linkify(part, `${key}-b${i}`)}</strong>);
    } else {
      nodes.push(...linkify(part, `${key}-t${i}`));
    }
  });
  return nodes;
}

const CALLOUT_STYLES: Record<BlogCalloutTone, { wrapper: string; label: string }> = {
  info: {
    wrapper: 'border-blue-500/40 bg-blue-500/10',
    label: 'text-blue-400',
  },
  tip: {
    wrapper: 'border-emerald-500/40 bg-emerald-500/10',
    label: 'text-emerald-400',
  },
  alert: {
    wrapper: 'border-amber-500/40 bg-amber-500/10',
    label: 'text-amber-400',
  },
};

function Block({ block, index }: { block: BlogBlock; index: number }) {
  const key = `b${index}`;

  switch (block.type) {
    case 'answer':
      return (
        <p
          data-testid="geo-answer"
          className="rounded-xl border-l-4 border-blue-500 bg-slate-900/80 p-4 text-sm leading-relaxed text-slate-200"
        >
          {renderInline(block.text, key)}
        </p>
      );

    case 'p':
      return <p className="leading-relaxed text-slate-300">{renderInline(block.text, key)}</p>;

    case 'h2':
      return (
        <h2 className="pt-4 text-2xl font-extrabold tracking-tight text-white">{block.text}</h2>
      );

    case 'h3':
      return <h3 className="pt-2 text-lg font-bold text-slate-100">{block.text}</h3>;

    case 'ul':
      return (
        <ul className="list-disc space-y-2 pl-6 text-slate-300">
          {block.items.map((item, i) => (
            <li key={`${key}-li${i}`}>{renderInline(item, `${key}-li${i}`)}</li>
          ))}
        </ul>
      );

    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900">
              <tr>
                {block.headers.map((header, i) => (
                  <th key={`${key}-th${i}`} className="px-4 py-3 font-bold text-slate-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={`${key}-tr${r}`} className="border-t border-slate-800">
                  {row.map((cell, c) => (
                    <td key={`${key}-td${r}-${c}`} className="px-4 py-3 align-top text-slate-400">
                      {renderInline(cell, `${key}-td${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'callout': {
      const style = CALLOUT_STYLES[block.tone];
      return (
        <aside className={`rounded-xl border-l-4 p-4 ${style.wrapper}`}>
          {block.title && (
            <p className={`mb-1 text-sm font-bold ${style.label}`}>{block.title}</p>
          )}
          <p className="text-sm leading-relaxed text-slate-300">
            {renderInline(block.text, key)}
          </p>
        </aside>
      );
    }

    case 'quote':
      return (
        <blockquote className="border-l-4 border-slate-700 pl-4 italic text-slate-400">
          {renderInline(block.text, key)}
          {block.cite && <footer className="mt-1 text-xs not-italic text-slate-500">— {block.cite}</footer>}
        </blockquote>
      );

    default:
      return null;
  }
}

type BlogContentProps = {
  post: BlogPost;
};

/** Renderiza o corpo do artigo: blocos tipados → FAQ (PAA) → links de saída. */
export function BlogContent({ post }: BlogContentProps) {
  return (
    <div className="space-y-5">
      {post.content.map((block, i) => (
        <Block key={`block-${i}`} block={block} index={i} />
      ))}

      {post.faq && post.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="space-y-4 pt-4">
          <h2 id="faq-heading" className="text-2xl font-extrabold text-white">
            Perguntas da Galera (People Also Ask)
          </h2>
          <dl className="space-y-4">
            {post.faq.map((item, i) => (
              <div
                key={`faq-${i}`}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <dt className="font-bold text-slate-100">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-400">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {post.relatedLinks.length > 0 && (
        <nav aria-label="Continue lendo" className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-slate-200">Continue lendo no Meteor 2.0</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {post.relatedLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-blue-400 transition-colors hover:border-blue-500/50 hover:text-blue-300"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
