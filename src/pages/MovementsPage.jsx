import { useEffect, useState } from 'react';
const emitUpdate = () => window.dispatchEvent(new CustomEvent('stock-updated'));
import { ArrowRightLeft, Plus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StateView from '../components/common/StateView';
import Modal from '../components/ui/Modal';
import { extractListData } from '../services/api';
import { movementService } from '../services/movementService';
import { productService } from '../services/productService';

const MovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ product: '', type: 'ENTRY', quantity: 1, reason: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        movementService.getAll(),
        productService.getAll(),
      ]);
      setMovements(extractListData(mRes, []));
      setProducts(extractListData(pRes, []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao carregar movimentações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ product: '', type: 'ENTRY', quantity: 1, reason: '' }); setModal('create'); setFormError(''); };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      await movementService.create({ ...form, quantity: Number(form.quantity) });
      setModal(null);
      emitUpdate();
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Erro ao registrar movimentação.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Movimentações" description="Histórico de entradas e saídas do estoque." action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Nova Movimentação
        </button>
      } />

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">Carregando...</div>
      ) : error ? (
        <StateView title="Erro" description={error} icon={ArrowRightLeft} />
      ) : movements.length === 0 ? (
        <StateView title="Sem movimentações" description="Nenhuma movimentação registrada." icon={ArrowRightLeft} />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Produto</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tipo</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Quantidade</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Motivo</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{m.product?.name || m.product || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${m.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {m.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{m.reason || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' ? (
        <Modal title="Nova Movimentação" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Produto</label>
            <select value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue">
              <option value="">Selecione o produto</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name} (Estoque: {p.quantity})</option>)}
            </select>
            </div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo de Movimentação</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue">
              <option value="ENTRY">Entrada</option>
              <option value="EXIT">Saída</option>
            </select>
            </div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Quantidade</label>
            <input type="number" min="1" placeholder="Quantidade" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" />
            </div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Motivo (opcional)</label>
            <textarea placeholder="Ex: Reposição de estoque" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" rows={2} />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default MovementsPage;
