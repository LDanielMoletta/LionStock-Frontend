import { useEffect, useState } from 'react';
import { Users2, Pencil, Trash2, Plus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StateView from '../components/common/StateView';
import Modal from '../components/ui/Modal';
import { extractListData } from '../services/api';
import { userService } from '../services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer', active: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const res = await userService.getAll();
      setUsers(extractListData(res, []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '', email: '', password: '', role: 'viewer', active: true }); setModal('create'); setFormError(''); };
  const openEdit = (u) => { setForm({ _id: u._id, name: u.name || '', email: u.email || '', password: '', role: u.role || 'viewer', active: typeof u.active === 'boolean' ? u.active : true }); setModal('edit'); setFormError(''); };
  const openDelete = (u) => { setForm(u); setModal('delete'); };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal === 'create') {
        await userService.create(form);
      } else {
        const payload = { name: form.name, email: form.email, role: form.role, active: form.active };
        if (form.password) payload.password = form.password;
        await userService.update(form._id, payload);
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
      await userService.remove(form._id);
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
      <PageHeader title="Usuários" description="Gerencie acessos e permissões." action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo Usuário
        </button>
      } />

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">Carregando...</div>
      ) : error ? (
        <StateView title="Erro" description={error} icon={Users2} />
      ) : users.length === 0 ? (
        <StateView title="Sem usuários" description="Nenhum usuário cadastrado." icon={Users2} />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Nome</th>
                <th className="px-4 py-3 font-semibold text-slate-700">E-mail</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Perfil</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" title="Editar"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => openDelete(u)} className="rounded-xl p-2 text-red-400 hover:bg-red-50" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' || modal === 'edit' ? (
        <Modal title={modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Nome do Usuário</label><input placeholder="Nome completo" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</label><input placeholder="email@exemplo.com" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Senha</label>
            {modal === 'create' ? (
              <input placeholder="Mínimo 6 caracteres" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" />
            ) : (
              <input placeholder="Deixe em branco para manter" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue" />
            )}
            </div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Perfil</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue">
              <option value="admin">Admin</option>
              <option value="operator">Operador</option>
              <option value="viewer">Visualizador</option>
            </select>
            </div>
            {modal === 'edit' ? (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="rounded border-slate-300" />
                Usuário ativo
              </label>
            ) : null}
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      ) : null}

      {modal === 'delete' ? (
        <Modal title="Excluir Usuário" onClose={() => setModal(null)}>
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

export default UsersPage;
