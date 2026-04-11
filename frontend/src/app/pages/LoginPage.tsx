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
    <div style={{
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      margin: 0,
      padding: 0, 
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      
      <div style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '400px',
        padding: '1.75rem 2.25rem',
        borderRadius: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f3f4f6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>

        {/* LOGO - USANDO SHIELDPLUS DE LUCIDE PARA CENTRADO PERFECTO */}
        <div style={{ 
          backgroundColor: '#0f172a', 
          width: '48px',
          height: '48px',
          borderRadius: '10px', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldPlus color="white" size={28} strokeWidth={2.5} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.15rem 0', letterSpacing: '-0.025em' }}>
          NexoMed
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
          Sistema de Gestión Clínica Hospitalaria
        </p>

        <div style={{ width: '100%', marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151', fontSize: '0.8rem' }}>
            Seleccionar Usuario
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
             <User size={16} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
             <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '0.6rem',
                border: '1px solid #e5e7eb',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                color: '#1f2937',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
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
          style={{
            width: '100%',
            backgroundColor: '#05050a',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.6rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: (!selectedUser || loginMutation.isPending) ? 0.6 : 1,
            transition: 'all 0.2s ease',
            marginBottom: '1.5rem'
          }}
        >
          {loginMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          <span>Iniciar Sesión</span>
        </button>

        <div style={{ width: '100%', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem' }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Demo:</span> Selecciona usuario para acceder
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem' }}>👨‍⚕️</span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>1 Médico, 5 Enfermeros, 2 TCAE</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem' }}>🏥</span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>Planta única (101-112 A/B)</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '400', margin: 0 }}>
          NexoMed v1.0 — Sistema Hospitalario Integrado
        </p>
      </div>
    </div>
  );
}