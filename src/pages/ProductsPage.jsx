import { useEffect, useState } from 'react';
import { Boxes, Pencil, Trash2, Plus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StateView from '../components/common/StateView';
import Modal from '../components/ui/Modal';
import { extractListData } from '../services/api';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import generateSku from '../utils/generateSku';

let editingProductId = null;

const emptyForm = { _id: '', sku: '', name: '', description: '', category: '', supplier: '', quantity: 0, unitPrice: 0 };

const emitUpdate = () => window.dispatchEvent(new CustomEvent('stock-updated'));

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const [pRes, cRes, sRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supplierService.getAll(),
      ]);
      setProducts(extractListData(pRes, []));
      setCategories(extractListData(cRes, []));
      setSuppliers(extractListData(sRes, []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...emptyForm, sku: generateSku() }); editingProductId = null; setModal('create'); setFormError(''); };

  const openEdit = (p) => {
    editingProductId = p._id;
    setForm({
      _id: p._id,
      sku: p.sku || '',
      name: p.name || '',
      description: p.description || '',
      category: p.category?._id || p.category || '',
      supplier: p.supplier?._id || p.supplier || '',
      quantity: p.quantity ?? 0,
      unitPrice: p.unitPrice ?? 0,
    });
    setModal('edit');
    setFormError('');
  };

  const openDelete = (p) => { editingProductId = p._id; setForm({ _id: p._id, name: p.name }); setModal('delete'); };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal === 'create') {
        await productService.create(form);
      } else {
        const id = editingProductId || form._id;
        if (!id) { setFormError('ID do produto não encontrado.'); setSaving(false); return; }
        await productService.update(id, {
          name: form.name, description: form.description,
          category: form.category, supplier: form.supplier,
          quantity: Number(form.quantity), unitPrice: Number(form.unitPrice),
        });
      }
      setModal(null);
      emitUpdate();
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
      await productService.remove(editingProductId || form._id);
      setModal(null);
      emitUpdate();
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Erro ao excluir.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div>
      <PageHeader title="Produtos" description="Gerencie o estoque de produtos." action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      } />

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">Carregando...</div>
      ) : error ? (
        <StateView title="Erro" description={error} icon={Boxes} />
      ) : products.length === 0 ? (
        <StateView title="Sem produtos" description="Nenhum produto cadastrado." icon={Boxes} />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">SKU</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Nome</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Categoria</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Fornecedor</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Qtd</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Preço</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.supplier?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">R$ {(p.unitPrice || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => openDelete(p)} className="rounded-xl p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' || modal === 'edit' ? (
        <Modal title={modal === 'create' ? 'Novo Produto' : 'Editar Produto'} onClose={() => setModal(null)}>
          <div className="space-y-5">
            <div>
              <p className="mb-1 text-xs text-slate-400">Nome que aparecerá nas listas e na busca do sistema.</p>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Nome do Produto</label>
              <input placeholder="Ex: Teclado Mecânico" value={form.name} onChange={set('name')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue focus:ring-2 focus:ring-lion-blue/10" />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Informações adicionais sobre o produto (opcional).</p>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Descrição</label>
              <textarea placeholder="Ex: Teclado mecânico RGB, switch azul, ABNT2" value={form.description} onChange={set('description')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue focus:ring-2 focus:ring-lion-blue/10" rows={2} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Classificação usada para agrupar produtos semelhantes.</p>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Categoria</label>
              <select value={form.category} onChange={set('category')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue focus:ring-2 focus:ring-lion-blue/10">
                <option value="">Selecione a categoria</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Empresa responsável pelo fornecimento deste produto.</p>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Fornecedor</label>
              <select value={form.supplier} onChange={set('supplier')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue focus:ring-2 focus:ring-lion-blue/10">
                <option value="">Selecione o fornecedor</option>
                {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Número atual de unidades disponíveis no estoque.</p>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Quantidade em Estoque</label>
              <input type="number" min="0" placeholder="0" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-lion-blue focus:ring-2 focus:ring-lion-blue/10" />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Valor de venda de uma única unidade do produto.</p>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Preço Unitário</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">R$</span>
                <input type="text" inputMode="decimal" placeholder="0,00" value={form.unitPrice ? String(form.unitPrice).replace('.', ',') : ''} onChange={(e) => { const v = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.'); setForm((p) => ({ ...p, unitPrice: v ? Number(v) : 0 })); }} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pl-10 text-sm outline-none focus:border-lion-blue focus:ring-2 focus:ring-lion-blue/10" />
              </div>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-lion-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      ) : null}

      {modal === 'delete' ? (
        <Modal title="Excluir Produto" onClose={() => setModal(null)}>
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

export default ProductsPage;
