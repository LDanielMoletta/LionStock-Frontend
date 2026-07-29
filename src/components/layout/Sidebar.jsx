import { LayoutDashboard, Boxes, Package, Briefcase, ReceiptText, Users, Settings, LogOut, Warehouse } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
  { label: 'Produtos', path: '/products', icon: Boxes, roles: ['admin', 'operator'] },
  { label: 'Categorias', path: '/categories', icon: Package, roles: ['admin', 'operator'] },
  { label: 'Fornecedores', path: '/suppliers', icon: Briefcase, roles: ['admin', 'operator'] },
  { label: 'Movimentações', path: '/movements', icon: ReceiptText, roles: ['admin', 'operator'] },
  { label: 'Usuários', path: '/users', icon: Users, roles: ['admin'] },
  { label: 'Perfil', path: '/profile', icon: Settings, roles: ['admin', 'operator', 'viewer'] },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role || 'viewer'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white p-6 shadow-soft transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lion-blue text-white">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">LionStock</p>
            <p className="text-sm text-slate-500">Inventory control</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Conta</p>
          <p className="mt-2 font-semibold text-slate-800">{user?.name || 'Usuário'}</p>
          <p className="text-sm text-slate-500">{user?.role || 'viewer'}</p>
        </div>

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {visibleItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? 'bg-lion-blue text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-lion-gold px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
