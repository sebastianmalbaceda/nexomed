import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, ShieldPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { SEED_CREDENTIALS } from '@/lib/constants';
import type { LoginResponse } from '@/lib/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState('');

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<LoginResponse>('/auth/login', data),
    onSuccess: (result) => {
      setAuth(result.token, result.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const handleLogin = () => {
    const creds = SEED_CREDENTIALS.find((c) => c.email === selectedUser);
    if (creds) loginMutation.mutate({ email: creds.email, password: creds.password });
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-[90%] max-w-[400px] bg-white rounded-[1.25rem] p-7 shadow-md border border-gray-100 flex flex-col items-center">
        <div className="bg-slate-900 w-12 h-12 rounded-xl mb-4 flex items-center justify-center">
          <ShieldPlus color="white" size={28} strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
          NexoMed
        </h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Sistema de Gestión Clínica Hospitalaria
        </p>

        <div className="w-full mb-4">
          <label className="block font-semibold mb-1 text-gray-700 text-xs">
            Seleccionar Usuario
          </label>
          <div className="relative flex items-center">
            <User size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-800 cursor-pointer outline-none font-medium appearance-none"
            >
              <option value="">-- Selecciona un usuario --</option>
              {SEED_CREDENTIALS.map((c) => (
                <option key={c.email} value={c.email}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={!selectedUser || loginMutation.isPending}
          className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold border-none cursor-pointer flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 mb-6"
        >
          {loginMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          <span>Iniciar Sesión</span>
        </button>

        <div className="w-full border-t border-gray-100 pt-4">
          <div className="flex gap-2 mb-1.5">
            <span className="text-sm">💡</span>
            <p className="m-0 text-xs text-gray-400">
              <span className="text-gray-500 font-medium">Demo:</span> Selecciona usuario para acceder
            </p>
          </div>
          <div className="flex gap-2 mb-1.5">
            <span className="text-sm">👨‍⚕️</span>
            <p className="m-0 text-xs text-gray-400">1 Médico, 5 Enfermeros, 2 TCAE</p>
          </div>
          <div className="flex gap-2">
            <span className="text-sm">🏥</span>
            <p className="m-0 text-xs text-gray-400">Planta única (101-112 A/B)</p>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <p className="text-xs text-gray-400 font-normal m-0">
          NexoMed v1.0 — Sistema Hospitalario Integrado
        </p>
      </div>
    </div>
  );
}