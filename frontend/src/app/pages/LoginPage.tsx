import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Loader2 } from 'lucide-react';
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
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      padding: '2rem',
      margin: 0,
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div
        className="w-full max-w-xl p-14"
        style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '1.5rem',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: [
            '0 1px 2px rgba(0,0,0,0.4)',
            '0 4px 8px rgba(0,0,0,0.3)',
            '0 12px 24px rgba(0,0,0,0.25)',
            '0 24px 48px rgba(0,0,0,0.2)',
          ].join(', '),
        }}
      >

        {/* Logo y título */}
        <div className="flex flex-col items-center mb-12">
          <svg
            viewBox="0 0 40 30"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2"
            width={72}
            height={72}
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight mt-5">
            NexoMed
          </h1>
          <p className="text-gray-500 mt-2 text-base text-center">
            Sistema de Gestión Clínica Hospitalaria
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-7">
          <div>
            <label className="block text-base font-semibold text-[#0f172a] mb-2">
              Seleccionar Usuario
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white appearance-none cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 transition-colors text-[#0f172a] text-base"
              >
                <option value="">-- Selecciona un usuario --</option>
                {SEED_CREDENTIALS.map((c) => (
                  <option key={c.email} value={c.email}>
                    {c.label} ({c.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {loginMutation.isError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : 'Error al iniciar sesión'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={!selectedUser || loginMutation.isPending}
            className="w-full bg-[#0f172a] text-white py-4 rounded-xl text-base font-semibold cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black active:bg-black"
          >
            {loginMutation.isPending
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Lock className="w-5 h-5" />
            }
            Iniciar Sesión
          </button>

          {/* Info */}
          <div className="pt-7 border-t border-gray-200 space-y-2.5">
            <p className="text-sm text-gray-500">
              💡 <strong className="text-gray-700">Demo:</strong> Selecciona cualquier usuario para acceder
            </p>
            <p className="text-sm text-gray-500">
              👨‍⚕️ Personal: 1 Médico, 5 Enfermeros, 2 TCAE
            </p>
            <p className="text-sm text-gray-500">
              🏥 Planta única con 12 habitaciones (101-112 A/B)
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-sm text-gray-400">
          NexoMed v1.0 — Sistema Hospitalario Integrado
        </p>
      </div>
    </div>
  );
}