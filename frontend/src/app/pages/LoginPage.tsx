import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { SEED_CREDENTIALS } from '@/lib/constants';
import type { LoginResponse } from '@/lib/types';

const schema = z.object({
  email:    z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const loginMutation = useMutation({
    mutationFn: (data: FormValues) =>
      api.post<LoginResponse>('/auth/login', data),
    onSuccess: (result) => {
      setAuth(result.token, result.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const onSubmit = (data: FormValues) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">

          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-10 h-10 text-primary-foreground"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">NexoMed</h1>
            <p className="text-muted-foreground">Sistema de Gestión Clínica Hospitalaria</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@nexomed.es"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-sm"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Error global */}
            {loginMutation.isError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">
                  {loginMutation.error instanceof Error
                    ? loginMutation.error.message
                    : 'Credenciales incorrectas'}
                </p>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loginMutation.isPending
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
                : <><Lock className="w-5 h-5" /> Iniciar Sesión</>
              }
            </button>
          </form>

          {/* Acceso rápido */}
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-xs font-medium text-muted-foreground text-center">
              Acceso rápido (datos de prueba)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SEED_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    setValue('email', cred.email);
                    setValue('password', cred.password);
                  }}
                  className="flex flex-col items-center gap-1 bg-background border border-input rounded-lg py-3 px-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-center cursor-pointer"
                >
                  <span className="text-xl">
                    {cred.role === 'DOCTOR' ? '🩺' : cred.role === 'NURSE' ? '💊' : '🏥'}
                  </span>
                  <span className="text-xs font-medium text-foreground leading-tight">
                    {cred.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1 pt-1">
              <p>💡 <strong>Contraseña:</strong> <span className="font-mono">password123</span></p>
              <p>👨‍⚕️ Personal: 1 Médico, 2 Enfermeros, 1 TCAE</p>
              <p>🏥 Planta única · 6 habitaciones · 6 pacientes</p>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          NexoMed v1.0 — Sistema Hospitalario Integrado
        </p>
      </div>
    </div>
  );
}
