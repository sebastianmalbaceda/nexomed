import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BedDouble, 
  Search, 
  X, 
  Calendar, 
  Activity, 
  Loader2, 
  LogOut, 
  UserPlus, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Bed, Patient } from '@/lib/types';

// ── LÓGICA DE EMOJIS POR EDAD ──
const getPatientEmoji = (dobString: string) => {
  const birthDate = new Date(dobString);
  const age = new Date().getFullYear() - birthDate.getFullYear();
  if (age >= 75) return "👵"; 
  if (age >= 65) return "👴"; 
  if (age >= 18) return "🧑"; 
  return "👶";
};

// ── LÓGICA DE COLORES POR DIAGNÓSTICO ──
const getStatusStyles = (diagnosis: string = "") => {
  const d = diagnosis.toLowerCase();
  const isCritical = ['crítico', 'critico', 'infarto', 'iam', 'urgente', 'sepsis', 'shock', 'pcr', 'reanimación'].some(k => d.includes(k));
  const isModerate = ['moderado', 'observación', 'observacion', 'epoc', 'reagudizado', 'postoperatorio', 'cetoacidosis'].some(k => d.includes(k));
  if (isCritical) return { border: 'border-t-red-500', badge: 'bg-red-500', text: 'CRÍTICO', bg: 'bg-red-50/30' };
  if (isModerate) return { border: 'border-t-orange-400', badge: 'bg-orange-400', text: 'MODERADO', bg: 'bg-orange-50/30' };
  return { border: 'border-t-emerald-400', badge: 'bg-emerald-400', text: 'ESTABLE', bg: 'bg-emerald-50/30' };
};

const EMPTY_FORM = { name: '', dob: '', diagnosis: '', allergies: '', gender: '' };

export default function BedMapPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [admitError, setAdmitError] = useState('');

  const { data: beds = [], isLoading } = useQuery({
    queryKey: ['beds'],
    queryFn: () => api.get<Bed[]>('/beds'),
  });

  const dischargeMutation = useMutation({
    mutationFn: (id: string) => api.put(`/patients/${id}/discharge`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beds'] });
      qc.invalidateQueries({ queryKey: ['patients'] });
      setSelectedBed(null);
    }
  });

  const admitMutation = useMutation({
    mutationFn: async (bedId: string) => {
      const allergiesArr = form.allergies.split(',').map(s => s.trim()).filter(Boolean);
      return api.post<Patient>('/patients', {
        name: form.name.trim(),
        dob: new Date(form.dob).toISOString(),
        diagnosis: form.diagnosis.trim(),
        allergies: allergiesArr,
        bedId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beds'] });
      qc.invalidateQueries({ queryKey: ['patients'] });
      setSelectedBed(null);
      setShowAdmitForm(false);
      setForm(EMPTY_FORM);
      setAdmitError('');
    },
    onError: (e: Error) => setAdmitError(e.message),
  });

  const filteredBeds = beds.filter(b =>
    b.room.toString().includes(searchTerm) ||
    b.patient?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#f9fafb] p-4 md:p-8 overflow-hidden font-sans">
      
      {/* HEADER TIPO DASHBOARD */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Planta 1</span>
               <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Turno Mañana</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mapa de Camas</h1>
            <p className="text-slate-500 text-sm font-medium">Gestión visual de unidades y pacientes</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar paciente o cama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 ring-blue-500/20 outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : (
          filteredBeds.map((bed) => {
            const patient = bed.patient;
            const isOccupied = !!patient;
            const styles = isOccupied ? getStatusStyles(patient.diagnosis) : null;
            const isCritical = patient?.diagnosis.toLowerCase().includes('crítico');

            return (
              <div 
                key={bed.id}
                onClick={() => setSelectedBed(bed)}
                className={`group cursor-pointer relative bg-white rounded-2xl border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 
                  ${isOccupied ? `border-t-4 ${styles?.border}` : 'border-dashed opacity-70 grayscale-[0.5]'}`}
              >
                {/* Cabecera Tarjeta: Cama y Estado */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className={`w-4 h-4 ${isOccupied ? 'text-slate-800' : 'text-slate-300'}`} />
                    <span className="font-black text-slate-900 text-sm">{bed.room}-{bed.letter}</span>
                  </div>
                  {isOccupied && (
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded text-white tracking-widest ${styles?.badge}`}>
                      {styles?.text}
                    </span>
                  )}
                </div>

                {/* Info Paciente */}
                {isOccupied ? (
                  <div className="space-y-3">
                    <div className="min-h-[40px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPatientEmoji(patient.dob)}</span>
                        <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {patient.name}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 ml-8">
                        {new Date().getFullYear() - new Date(patient.dob).getFullYear()} años
                      </p>
                    </div>
                    
                    {/* INDICADORES VISUALES (REQUERIDO) */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1" title="Dieta controlada">
                        <span className="text-sm">🍎</span>
                        <span className="text-[9px] font-bold text-slate-400">DIETA</span>
                      </div>
                      
                      {patient.allergies.length > 0 && (
                        <div className="flex items-center gap-1" title="Alergias">
                          <span className="text-sm">🚫</span>
                          <span className="text-[9px] font-bold text-red-500">ALERGIA</span>
                        </div>
                      )}

                      {isCritical && (
                        <div className="ml-auto animate-bounce">
                           <span className="text-sm">⚠️</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center opacity-40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cama Libre</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── DRAWER LATERAL (PANEL DETALLE) ── */}
      {selectedBed && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedBed(null)}
          />
          
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
            {/* Header del Drawer */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Detalles de Unidad</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Habitación {selectedBed.room}-{selectedBed.letter}</p>
              </div>
              <button 
                onClick={() => setSelectedBed(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Contenido del Drawer */}
            <div className="flex-1 overflow-y-auto p-8">
              {selectedBed.patient ? (
                <div className="space-y-8">
                  {/* Ficha Principal */}
                  <div className="flex items-center gap-5 p-4 bg-slate-900 rounded-3xl shadow-xl shadow-slate-200">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl">
                       {getPatientEmoji(selectedBed.patient.dob)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {selectedBed.patient.name}
                      </h3>
                      <p className="text-blue-300 text-xs font-bold mt-1">NHC: 7721092-A</p>
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Juicio Clínico
                    </label>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed font-medium">
                      "{selectedBed.patient.diagnosis}"
                    </div>
                  </div>

                  {/* Alertas Detalladas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-lg">🍎</span>
                         <p className="text-[10px] font-black text-orange-700 uppercase">Alimentación</p>
                       </div>
                       <p className="text-xs font-bold text-orange-900">Dieta Blanda / Hiposódica</p>
                    </div>
                    
                    <div className={`p-4 rounded-2xl border ${selectedBed.patient.allergies.length > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-lg">🚫</span>
                         <p className={`text-[10px] font-black uppercase ${selectedBed.patient.allergies.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                           Alergias
                         </p>
                       </div>
                       <p className={`text-xs font-bold ${selectedBed.patient.allergies.length > 0 ? 'text-red-900' : 'text-emerald-900'}`}>
                        {selectedBed.patient.allergies.join(', ') || 'Sin alergias conocidas'}
                       </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    {user?.role === 'DOCTOR' && (
                    <button
                      onClick={() => dischargeMutation.mutate(selectedBed.patient!.id)}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                    >
                      <LogOut className="w-4 h-4" /> Tramitar Alta Médica
                    </button>
                    )}
                    <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">
                      Ver Historial Completo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                      <BedDouble className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Unidad Vacía</h3>
                    <p className="text-xs text-slate-400 mt-2">Esta cama está lista para recibir un nuevo ingreso.</p>
                  </div>

                  {user?.role === 'DOCTOR' && !showAdmitForm && (
                    <button
                      onClick={() => setShowAdmitForm(true)}
                      className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      <UserPlus className="w-5 h-5" /> Registrar Ingreso
                    </button>
                  )}

                  {user?.role === 'DOCTOR' && showAdmitForm && (
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Datos del paciente</p>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nombre completo *</label>
                        <input
                          type="text"
                          placeholder="Nombre y apellidos"
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Fecha de nacimiento *</label>
                        <input
                          type="date"
                          value={form.dob}
                          onChange={(e) => setForm(f => ({ ...f, dob: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Género *</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-slate-300"
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="Mujer">Mujer</option>
                          <option value="Hombre">Hombre</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Diagnóstico *</label>
                        <input
                          type="text"
                          placeholder="Diagnóstico principal"
                          value={form.diagnosis}
                          onChange={(e) => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Alergias (separadas por coma)</label>
                        <input
                          type="text"
                          placeholder="penicilina, ibuprofeno..."
                          value={form.allergies}
                          onChange={(e) => setForm(f => ({ ...f, allergies: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-slate-300"
                        />
                      </div>

                      {admitError && (
                        <p className="text-xs text-red-600 font-medium">{admitError}</p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => admitMutation.mutate(selectedBed.id)}
                          disabled={!form.name.trim() || !form.dob || !form.diagnosis.trim() || !form.gender || admitMutation.isPending}
                          className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {admitMutation.isPending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <UserPlus className="w-4 h-4" />}
                          Confirmar
                        </button>
                        <button
                          onClick={() => { setShowAdmitForm(false); setForm(EMPTY_FORM); setAdmitError(''); }}
                          className="px-4 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}