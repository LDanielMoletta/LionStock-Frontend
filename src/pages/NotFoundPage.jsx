import { SearchX } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lion-blue text-white">
          <SearchX className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-slate-900">Página não encontrada</h2>
        <p className="mt-2 text-sm text-slate-500">A rota acessada não existe ou foi removida.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
