import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setLoading(true);
    setServerError('');

    try {
      const response = await authService.login(values);
      login(response.data);
    } catch (error) {
      setServerError(error?.response?.data?.message || error?.message || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_60%)] px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-lion-blue p-8 text-white lg:p-12">
            <div className="inline-flex rounded-2xl bg-white/15 p-3">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold">LionStock</h1>
            <p className="mt-3 max-w-md text-sm text-blue-100">
              Controle de estoque, fornecedores, movimentações e usuários em uma única plataforma.
            </p>
            <div className="mt-10 rounded-3xl border border-white/20 bg-white/10 p-6">
              <p className="text-sm font-medium">Acesso seguro</p>
              <p className="mt-2 text-sm text-blue-100">Autenticação via token com proteção de sessão.</p>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lion-gold">Login</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Entre no painel</h2>
            <p className="mt-2 text-sm text-slate-500">Informe seu email e senha para continuar.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-lion-blue"
                  placeholder="seu@email.com"
                  {...register('email', { required: 'E-mail obrigatório' })}
                />
                {errors.email ? <p className="mt-2 text-sm text-red-500">{errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-lion-blue"
                  placeholder="Sua senha"
                  {...register('password', { required: 'Senha obrigatória' })}
                />
                {errors.password ? <p className="mt-2 text-sm text-red-500">{errors.password.message}</p> : null}
              </div>

              {serverError ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{serverError}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-lion-blue px-4 py-3 font-semibold text-white transition hover:opacity-90"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
