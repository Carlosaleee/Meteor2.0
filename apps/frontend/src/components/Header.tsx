import Link from 'next/link';

export function Header() {
  return (
    <header className="w-full bg-slate-900 text-white shadow-md">
      {/* Área de Capa (Hero) */}
      <div className="w-full bg-gradient-to-r from-blue-900 to-slate-900 py-12 px-6 text-center border-b border-slate-800">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Meteor 2.0</h1>
        <p className="mt-2 text-slate-400 text-sm md:text-base">Estrutura Base do Projeto</p>
      </div>

      {/* Menu de Navegação (Navbar) com 5 links */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="hover:text-blue-400 font-medium transition-colors">
            Principal
          </Link>
          <Link href="/pagina-1" className="hover:text-blue-400 font-medium transition-colors">
            Página 1
          </Link>
          <Link href="/pagina-2" className="hover:text-blue-400 font-medium transition-colors">
            Página 2
          </Link>
          <Link href="/pagina-3" className="hover:text-blue-400 font-medium transition-colors">
            Página 3
          </Link>
          <Link href="/pagina-4" className="hover:text-blue-400 font-medium transition-colors">
            Página 4
          </Link>
        </div>
      </nav>
    </header>
  );
}
