export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-8 px-6 border-t border-slate-800 text-center mt-auto">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm">&copy; {new Date().getFullYear()} Meteor 2.0. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
