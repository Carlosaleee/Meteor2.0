/**
 * Imagens de fallback por categoria de notícia.
 * Única fonte para home e /swell — antes as URLs ficavam duplicadas em
 * `app/page.tsx` (inline) e `app/swell/components/SurfNews.tsx`.
 */
export const FALLBACK_IMAGES: Record<string, string> = {
  WSL: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
  Paulista: 'https://static.wixstatic.com/media/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.webp',
};
