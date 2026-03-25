'use client';

import { useState } from 'react';
import { FileText, Clock, User, Save } from 'lucide-react';

interface ShiftReportProps {
  currentRole: string;
}

export function ShiftReport({ currentRole }: ShiftReportProps) {
  const [summary, setSummary] = useState('');
  const [incidents, setIncidents] = useState('');

  const getRoleTasks = () => {
    switch (currentRole) {
      case 'Médico/a':
        return [
          'Revisión de historias clínicas',
          'Evoluciones médicas completadas',
          'Prescripciones actualizadas',
          'Interconsultas solicitadas',
        ];
      
      case 'Enfermero/a':
        return [
          'Administración de medicación',
          'Registro de constantes vitales',
          'Curas realizadas',
          'Control de vías y drenajes',
        ];
      
      case 'TCAE':
        return [
          'Aseos personales completados',
          'Ayuda en alimentación',
          'Cambios posturales realizados',
          'Cambios de ropa de cama',
        ];
      
      default:
        return [
          'Revisión de equipos',
          'Actualización de inventario',
          'Capacitación de personal',
        ];
    }
  };

  const getPlaceholderText = () => {
    switch (currentRole) {
      case 'Médico/a':
        return 'Describe las valoraciones médicas, cambios en tratamientos, evolución de pacientes críticos...';
      case 'Enfermero/a':
        return 'Describe las medicaciones administradas, constantes relevantes, curas realizadas...';
      case 'TCAE':
        return 'Describe los cuidados básicos realizados, movilizaciones, ayudas prestadas...';
      default:
        return 'Describe las actividades principales del turno...';
    }
  };

  const tasks = getRoleTasks();
  const [completedTasks, setCompletedTasks] = useState<string[]>([...tasks]);

  const toggleTask = (task: string) => {
    setCompletedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Informe de Turno - {currentRole}
        </h2>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium">
          <Save className="w-4 h-4" />
          Guardar Informe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <span className="text-sm text-muted-foreground">Turno</span>
            <p className="text-foreground font-medium">Turno Tarde (14:00 - 22:00)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <User className="w-5 h-5 text-muted-foreground" />
          <div>
            <span className="text-sm text-muted-foreground">Responsable</span>
            <p className="text-foreground font-medium">Dr. Juan Pérez</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-foreground font-medium block mb-2">Resumen del Turno</label>
        <textarea
          className="w-full bg-background border border-border rounded-lg p-3 text-foreground resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={getPlaceholderText()}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-foreground font-medium block mb-2">Incidencias</label>
        <textarea
          className="w-full bg-background border border-border rounded-lg p-3 text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Registra cualquier incidencia o novedad relevante para el siguiente turno..."
          value={incidents}
          onChange={(e) => setIncidents(e.target.value)}
        />
      </div>

      <div>
        <label className="text-foreground font-medium block mb-2">Tareas Completadas</label>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                 onClick={() => toggleTask(task)}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                completedTasks.includes(task) 
                  ? 'bg-primary border-primary' 
                  : 'border-border'
              }`}>
                {completedTasks.includes(task) && (
                  <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-foreground ${completedTasks.includes(task) ? '' : 'line-through opacity-50'}`}>
                {task}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
