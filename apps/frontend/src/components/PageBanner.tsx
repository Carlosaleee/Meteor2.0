import Image from 'next/image';

type PageBannerProps = {
  title: string;
  subtitle?: string;
};

export function PageBanner({ title, subtitle }: PageBannerProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '160px' }}>
      <Image
        src="/banner-meteor.jpg"
        alt={`Banner — ${title}`}
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 via-[var(--color-header-bg)]/80 to-[var(--color-header-bg)]/85" />
      <div className="absolute inset-0 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-gold)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
