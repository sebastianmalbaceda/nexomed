import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Loader2, Calendar, BedDouble, ArrowLeft, Activity, Pill, FileText, Clock, LogOut, UserPlus, X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Patient, Medication, CareRecord, VitalSigns } from '@/lib/types';

// Computed once at module load — avoids impure Date.now() calls during render
const NOW_MS = new Date().getTime();

function ageFromDob(dob: string): number {
  return Math.floor((NOW_MS - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PatientsPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });

  const { data: patientMedications = [] } = useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => api.get<Medication[]>(`/patients/${patientId}/medications`),
    enabled: !!patientId,
  });

  const { data: patientCareRecords = [] } = useQuery({
    queryKey: ['careRecords', patientId],
    queryFn: () => api.get<CareRecord[]>(`/patients/${patientId}/care-records`),
    enabled: !!patientId,
  });

  const { data: patientVitals = [] } = useQuery({
    queryKey: ['vitals', patientId],
    queryFn: () => api.get<VitalSigns[]>(`/patients/${patientId}/vitals`),
    enabled: !!patientId,
  });

  const selectedPatient = patientId ? patients.find((p) => p.id === patientId) : null;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const dischargeMutation = useMutation({
    mutationFn: (id: string) => api.put(`/patients/${id}/discharge`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/patients');
    },
  });

  const isDoctor = user?.role === 'DOCTOR';

  // Formulario de registro / re-ingreso
  const [showForm, setShowForm] = useState(false);
  const [dniSearch, setDniSearch] = useState('');
  const [dniFound, setDniFound] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    dni: '',
    name: '',
    surnames: '',
    dob: '',
    diagnosis: '',
    allergies: [] as string[],
    bedId: '',
  });
  const [allergyInput, setAllergyInput] = useState('');

  const searchDniMutation = useMutation({
    mutationFn: (dni: string) => api.get<Patient>(`/patients/search?dni=${encodeURIComponent(dni)}`),
    onSuccess: (patient) => {
      setDniFound(patient);
      setForm(f => ({
        ...f,
        dni: patient.dni ?? '',
        name: patient.name,
        surnames: patient.surnames ?? '',
        dob: patient.dob,
        diagnosis: '',
        allergies: [...patient.allergies],
      }));
    },
    onError: () => {
      setDniFound(null);
      setForm(f => ({ ...f, dni: dniSearch, name: '', surnames: '', dob: '', diagnosis: '', allergies: [] }));
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/patients', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
      setDniSearch('');
      setDniFound(null);
      setForm({ dni: '', name: '', dob: '', diagnosis: '', allergies: [], bedId: '' });
    },
  });

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !form.allergies.includes(allergyInput.trim())) {
      setForm(f => ({ ...f, allergies: [...f.allergies, allergyInput.trim()] }));
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setForm(f => ({ ...f, allergies: f.allergies.filter(a => a !== allergy) }));
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(search.toLowerCase()),
  );

  if (selectedPatient) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a pacientes
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedPatient.name} {selectedPatient.surnames}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedPatient.diagnosis}
            </p>
            {selectedPatient.dni && (
              <p className="text-xs text-muted-foreground mt-1">DNI: {selectedPatient.dni}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedPatient.bed && (
              <span className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                <BedDouble className="w-4 h-4" />
                Hab. {selectedPatient.bed.room}{selectedPatient.bed.letter}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              Ingreso: {new Date(selectedPatient.admissionDate).toLocaleDateString('es-ES')}
            </span>
            {isDoctor && !selectedPatient.discharged && (
              <button
                onClick={() => {
                  if (window.confirm('¿Confirmas que deseas dar de alta a este paciente? Esta acción liberará su cama y ocultará al paciente de la lista.')) {
                    dischargeMutation.mutate(selectedPatient.id);
                  }
                }}
                disabled={dischargeMutation.isPending}
                className="inline-flex items-center gap-1.5 text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {dischargeMutation.isPending ? 'Procesando...' : 'Dar de alta'}
              </button>
            )}
          </div>
        </div>

        {selectedPatient.allergies.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Alergias</p>
              <p className="text-sm text-destructive/80">{selectedPatient.allergies.join(', ')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Medicación activa</h3>
            </div>
            {patientMedications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin medicación activa</p>
            ) : (
              <ul className="space-y-3">
                {patientMedications.map((med) => (
                  <li key={med.id} className="text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="font-medium text-foreground">{med.drugName}</p>
                    <p className="text-muted-foreground mt-0.5">{med.dose} — cada {med.frequencyHrs}h</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-chart-2" />
              <h3 className="font-semibold text-foreground">Constantes vitales</h3>
            </div>
            {patientVitals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin constantes registradas</p>
            ) : (
              <ul className="space-y-3">
                {patientVitals.slice(0, 5).map((v) => (
                  <li key={v.id} className="text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="text-muted-foreground">{new Date(v.recordedAt).toLocaleString('es-ES')}</p>
                    <p className="text-foreground mt-0.5">
                      TA: {v.bloodPressureSystolic}/{v.bloodPressureDiastolic} mmHg | FC: {v.heartRate} lpm | Tª: {v.temperature}ºC
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-chart-4" />
              <h3 className="font-semibold text-foreground">Registro de cuidados</h3>
            </div>
            {patientCareRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin registros de cuidados</p>
            ) : (
              <ul className="space-y-3">
                {patientCareRecords.slice(0, 5).map((cr) => (
                  <li key={cr.id} className="text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="text-muted-foreground">{new Date(cr.recordedAt).toLocaleString('es-ES')}</p>
                    <p className="text-foreground mt-0.5">{cr.notes}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <FileText className="w-5 h-5 text-chart-3" />
            <h3 className="font-semibold text-foreground">Historial completo</h3>
            <button
              onClick={() => navigate(`/history?patientId=${selectedPatient.id}`)}
              className="ml-auto text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver historial <ArrowLeft className="w-3 h-3 rotate-180" />
            </button>
          </div>
          <div className="p-5 text-sm text-muted-foreground">
            Acceso rápido al historial unificado del paciente
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} en planta
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar por nombre o diagnóstico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-72"
            />
          </div>
          {isDoctor && (
            <button
              onClick={() => { setShowForm(true); setDniSearch(''); setDniFound(null); }}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Registrar ingreso
            </button>
          )}
        </div>
      </div>

      {/* Formulario de registro / re-ingreso */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Registro de ingreso</h2>
            <button onClick={() => { setShowForm(false); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Búsqueda por DNI */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">DNI del paciente</label>
              <input
                type="text"
                placeholder="Buscar por DNI..."
                value={dniSearch}
                onChange={(e) => setDniSearch(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={() => searchDniMutation.mutate(dniSearch)}
              disabled={!dniSearch || searchDniMutation.isPending}
              className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {searchDniMutation.isPending ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {searchDniMutation.isError && (
            <p className="text-sm text-muted-foreground">Paciente no encontrado. Puedes registrar uno nuevo con este DNI.</p>
          )}
          {dniFound && (
            <p className="text-sm text-green-600">✓ Paciente encontrado. Datos auto-rellenados (excepto diagnóstico).</p>
          )}

          {/* Resto del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">DNI * (9 dígitos)</label>
              <input
                type="text"
                value={form.dni}
                onChange={(e) => setForm(f => ({ ...f, dni: e.target.value }))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-2 focus:ring-ring"
                readOnly={!!dniFound}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-2 focus:ring-ring"
                readOnly={!!dniFound}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Apellidos *</label>
              <input
                type="text"
                value={form.surnames}
                onChange={(e) => setForm(f => ({ ...f, surnames: e.target.value }))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-2 focus:ring-ring"
                readOnly={!!dniFound}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de nacimiento *</label>
              <input
                type="date"
                value={form.dob ? new Date(form.dob).toISOString().split('T')[0] : ''}
                onChange={(e) => setForm(f => ({ ...f, dob: new Date(e.target.value).toISOString() }))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-2 focus:ring-ring"
                readOnly={!!dniFound}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Diagnóstico actual *</label>
              <input
                type="text"
                placeholder="Diagnóstico del ingreso actual..."
                value={form.diagnosis}
                onChange={(e) => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Asignar cama (opcional)</label>
              <select
                value={form.bedId}
                onChange={(e) => setForm(f => ({ ...f, bedId: e.target.value || '' }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sin asignar</option>
                {/* Aquí deberías cargar las camas libres con useQuery */}
              </select>
            </div>
          </div>

          {/* Alergias */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Alergias</label>
            <div className="flex items-end gap-2 mb-2">
              <input
                type="text"
                placeholder="Añadir alergia..."
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergy(); } }}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleAddAllergy}
                className="bg-secondary text-secondary-foreground text-sm px-3 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Añadir
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.allergies.map(a => (
                <span key={a} className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  {a}
                  <button onClick={() => handleRemoveAllergy(a)} className="hover:text-destructive/70"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {form.allergies.length === 0 && <span className="text-xs text-muted-foreground">Sin alergias</span>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              onClick={() => { setShowForm(false); }}
              className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
              <button
                onClick={() => createPatientMutation.mutate(form)}
                disabled={!form.name || !form.surnames || !form.dob || !form.diagnosis || !form.dni || createPatientMutation.isPending}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
              <Check className="w-4 h-4" />
              {createPatientMutation.isPending ? 'Registrando...' : dniFound ? 'Re-ingreso' : 'Registrar ingreso'}
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          No se pudieron cargar los pacientes. Verifica que el backend esté activo.
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {search ? 'Sin resultados para tu búsqueda' : 'No hay pacientes en planta'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Paciente</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Edad</th>
                  <th className="text-left px-5 py-3 font-medium">Diagnóstico</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Cama</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Ingreso</th>
                  <th className="text-left px-5 py-3 font-medium">Alergias</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="border-t border-border hover:bg-accent/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      {ageFromDob(p.dob)} años
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-52 truncate">
                      {p.diagnosis}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {p.bed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          <BedDouble className="w-3 h-3" />
                          Hab. {p.bed.room}{p.bed.letter}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.admissionDate).toLocaleDateString('es-ES')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.allergies.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                          <AlertCircle className="w-3 h-3" />
                          {p.allergies.join(', ')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin alergias</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
