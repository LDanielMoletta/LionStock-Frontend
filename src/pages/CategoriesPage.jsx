import { useEffect, useState } from 'react';
import { Tags, Pencil, Trash2, Plus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StateView from '../components/common/StateView';
import Modal from '../components/ui/Modal';
import { extractListData } from '../services/api';
import { categoryService } from '../services/categoryService';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(extractListData(res, []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '', description: '' }); setModal('create'); setFormError(''); };
  const openEdit = (c) => { setForm({ _id: c._id, name: c.name || '', description: c.description || '' }); setModal('edit'); setFormError(''); };
  const openDelete = (c) => { setForm(c); setModal('delete'); };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal === 'create') {
        await categoryService.create(form);
      } else {
        await categoryService.update(form._id, form);
      }
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await categoryService.remove(form._id);
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Erro ao excluir.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Categorias" description="Organize as categorias dos produtos." action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Nova Categoria
        </button>
      } />

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">Carregando...</div>
      ) : error ? (
        <StateView title="Erro" description={error} icon={Tags} />
      ) : categories.length === 0 ? (
        <StateView title="Sem categorias" description="Nenhuma categoria cadastrada." icon={Tags} />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Nome</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Descrição</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => openDelete(c)} className="rounded-xl p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' || modal === 'edit' ? (
        <Modal title={modal === 'create' ? 'Nova Categoria' : 'Editar Categoria'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Nome da Categoria</label><input placeholder="Ex: Eletrônicos" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Descrição</label><textarea placeholder="Descrição da categoria" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" rows={2} /></div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      ) : null}

      {modal === 'delete' ? (
        <Modal title="Excluir Categoria" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-600">Tem certeza que deseja excluir <strong>{form.name}</strong>?</p>
          {formError && <p className="mt-2 text-sm text-red-500">{formError}</p>}
          <div className="mt-4 flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button onClick={handleDelete} disabled={saving} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default CategoriesPage;
