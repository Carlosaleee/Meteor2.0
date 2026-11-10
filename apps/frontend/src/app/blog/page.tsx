import type { Metadata } from 'next';
import { BlogContent } from './BlogContent';

export const metadata: Metadata = {
  title: 'Blog | Meteor 2.0',
  description:
    'Guias e artigos sobre marés, surf, ecoturismo e meio ambiente no Litoral Sul de SP: Ilha Comprida, Cananéia, Juréia e o Vale do Ribeira.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Meteor 2.0',
    description:
      'Guias e artigos sobre marés, surf, ecoturismo e meio ambiente no Litoral Sul de SP.',
    url: '/blog',
    type: 'website',
    siteName: 'Meteor 2.0',
    locale: 'pt_BR',
  },
};

export default function BlogPage() {
  return <BlogContent />;
}
