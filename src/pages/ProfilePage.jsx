import { UserCircle2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Perfil" description="Visualize os dados da sua conta e permissões." />
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-lion-blue p-4 text-white">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{user?.name || 'Usuário LionStock'}</h3>
            <p className="text-sm text-slate-500">{user?.email || 'Seu e-mail aparecerá aqui.'}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Perfil</p>
            <p className="mt-2 font-semibold text-slate-900">{user?.role || 'viewer'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Status</p>
            <p className="mt-2 font-semibold text-slate-900">{user?.active ? 'Ativo' : 'Inativo'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
