import { useEffect, useState } from 'react';
import { Activity, Boxes, Briefcase, ReceiptText, Users } from 'lucide-react';
import StatusCard from '../components/common/StatusCard';
import PageHeader from '../components/common/PageHeader';
import { extractListData } from '../services/api';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import { movementService } from '../services/movementService';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, suppliers: 0, movements: 0 });
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes, sRes, mRes] = await Promise.all([
          productService.getAll().catch(() => ({ data: { data: [] } })),
          categoryService.getAll().catch(() => ({ data: { data: [] } })),
          supplierService.getAll().catch(() => ({ data: { data: [] } })),
          movementService.getAll().catch(() => ({ data: { data: [] } })),
        ]);
        const products = extractListData(pRes, []);
        const categories = extractListData(cRes, []);
        const suppliers = extractListData(sRes, []);
        const movements = extractListData(mRes, []);
        setStats({ products: products.length, categories: categories.length, suppliers: suppliers.length, movements: movements.length });
        setRecentMovements(movements.slice(-5).reverse());
      } catch {}
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('stock-updated', onUpdate);
    return () => window.removeEventListener('stock-updated', onUpdate);
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description={`Bem-vindo, ${user?.name || 'Usuário'}.`} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard title="Produtos" value={stats.products} icon={Boxes} accent="bg-lion-blue" />
        <StatusCard title="Categorias" value={stats.categories} icon={Activity} accent="bg-lion-gold" />
        <StatusCard title="Fornecedores" value={stats.suppliers} icon={Briefcase} accent="bg-emerald-500" />
        <StatusCard title="Movimentações" value={stats.movements} icon={ReceiptText} accent="bg-violet-500" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Últimas movimentações</h3>
          {recentMovements.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentMovements.map((m) => (
                <div key={m._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.product?.name || 'Produto'}</p>
                    <p className="text-xs text-slate-500">{m.reason || 'Sem motivo'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${m.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {m.type === 'ENTRY' ? '+' : '-'}{m.quantity}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">{m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Resumo</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-2xl bg-slate-50 p-3">{stats.products} produtos cadastrados</li>
            <li className="rounded-2xl bg-slate-50 p-3">{stats.categories} categorias ativas</li>
            <li className="rounded-2xl bg-slate-50 p-3">{stats.suppliers} fornecedores registrados</li>
            <li className="rounded-2xl bg-slate-50 p-3">{stats.movements} movimentações no sistema</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
