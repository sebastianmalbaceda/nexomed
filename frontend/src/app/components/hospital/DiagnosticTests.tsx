'use client';

import { useState } from 'react';
import { TestTube, Scan, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface TestResult {
  id: string;
  patient: string;
  room: string;
  type: 'laboratory' | 'imaging';
  category: string;
  testName: string;
  requestDate: string;
  resultDate?: string;
  status: 'pending' | 'completed' | 'critical';
  priority: 'routine' | 'urgent' | 'stat';
  requestedBy: string;
  results?: {
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    status: 'normal' | 'high' | 'low' | 'critical';
  }[];
  imageFindings?: string;
  clinicalIndication?: string;
}

interface DiagnosticTestsProps {
  currentRole: string;
}

export function DiagnosticTests({ currentRole }: DiagnosticTestsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'laboratory' | 'imaging'>('all');
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  const [allTests] = useState<TestResult[]>([
    // Pruebas de Laboratorio
    {
      id: 'LAB-001',
      patient: 'María González Ruiz',
      room: '101-A',
      type: 'laboratory',
      category: 'Hemograma',
      testName: 'Hemograma completo',
      requestDate: '17/03/2026 08:00',
      resultDate: '17/03/2026 12:30',
      status: 'critical',
      priority: 'urgent',
      requestedBy: 'Dr. Carlos Rodríguez',
      clinicalIndication: 'Control post-operatorio',
      results: [
        { parameter: 'Hemoglobina', value: '8.5', unit: 'g/dL', normalRange: '12-16', status: 'critical' },
        { parameter: 'Hematocrito', value: '26', unit: '%', normalRange: '36-46', status: 'low' },
        { parameter: 'Leucocitos', value: '15.2', unit: '10³/µL', normalRange: '4.5-11', status: 'high' },
        { parameter: 'Plaquetas', value: '180', unit: '10³/µL', normalRange: '150-400', status: 'normal' },
      ],
    },
    {
      id: 'LAB-002',
      patient: 'Juan Pérez Martín',
      room: '102-B',
      type: 'laboratory',
      category: 'Bioquímica',
      testName: 'Bioquímica completa',
      requestDate: '17/03/2026 07:00',
      resultDate: '17/03/2026 11:00',
      status: 'completed',
      priority: 'routine',
      requestedBy: 'Dr. Juan Pérez',
      clinicalIndication: 'Control rutinario',
      results: [
        { parameter: 'Glucosa', value: '95', unit: 'mg/dL', normalRange: '70-110', status: 'normal' },
        { parameter: 'Creatinina', value: '0.9', unit: 'mg/dL', normalRange: '0.7-1.2', status: 'normal' },
        { parameter: 'Urea', value: '35', unit: 'mg/dL', normalRange: '15-50', status: 'normal' },
        { parameter: 'Potasio', value: '4.2', unit: 'mEq/L', normalRange: '3.5-5.0', status: 'normal' },
      ],
    },
    {
      id: 'LAB-003',
      patient: 'Ana Martínez López',
      room: '103-A',
      type: 'laboratory',
      category: 'Coagulación',
      testName: 'Estudio de coagulación',
      requestDate: '17/03/2026 09:00',
      resultDate: '17/03/2026 14:00',
      status: 'critical',
      priority: 'stat',
      requestedBy: 'Dra. Ana Martínez',
      clinicalIndication: 'Pre-quirúrgico',
      results: [
        { parameter: 'INR', value: '3.8', unit: '', normalRange: '0.8-1.2', status: 'critical' },
        { parameter: 'TTPA', value: '52', unit: 'seg', normalRange: '25-35', status: 'high' },
        { parameter: 'Fibrinógeno', value: '280', unit: 'mg/dL', normalRange: '200-400', status: 'normal' },
      ],
    },
    {
      id: 'LAB-004',
      patient: 'Carlos Sánchez Vila',
      room: '105-B',
      type: 'laboratory',
      category: 'Cultivo',
      testName: 'Hemocultivo',
      requestDate: '16/03/2026 22:00',
      status: 'pending',
      priority: 'urgent',
      requestedBy: 'Dr. Carlos Rodríguez',
      clinicalIndication: 'Fiebre de origen desconocido',
    },
    {
      id: 'LAB-005',
      patient: 'Laura García Torres',
      room: '107-A',
      type: 'laboratory',
      category: 'Microbiología',
      testName: 'Urocultivo',
      requestDate: '17/03/2026 10:00',
      status: 'pending',
      priority: 'routine',
      requestedBy: 'Dr. Juan Pérez',
      clinicalIndication: 'Sospecha ITU',
    },

    // Pruebas de Imagen
    {
      id: 'IMG-001',
      patient: 'Pedro Morales Cruz',
      room: '108-B',
      type: 'imaging',
      category: 'Radiografía',
      testName: 'Rx Tórax PA y Lateral',
      requestDate: '17/03/2026 08:30',
      resultDate: '17/03/2026 13:00',
      status: 'critical',
      priority: 'urgent',
      requestedBy: 'Dr. Carlos Rodríguez',
      clinicalIndication: 'Disnea aguda',
      imageFindings: 'HALLAZGOS CRÍTICOS: Infiltrado alveolar en base pulmonar derecha compatible con neumonía. Derrame pleural moderado derecho. Índice cardiotorácico aumentado (0.58).',
    },
    {
      id: 'IMG-002',
      patient: 'Rosa Fernández Díaz',
      room: '110-A',
      type: 'imaging',
      category: 'Ecografía',
      testName: 'Eco Abdominal',
      requestDate: '17/03/2026 09:00',
      resultDate: '17/03/2026 12:00',
      status: 'completed',
      priority: 'routine',
      requestedBy: 'Dra. Ana Martínez',
      clinicalIndication: 'Dolor abdominal',
      imageFindings: 'Hígado de tamaño y ecogenicidad normal. Vesícula biliar sin litiasis. Vía biliar no dilatada. Páncreas, bazo y riñones sin alteraciones significativas.',
    },
    {
      id: 'IMG-003',
      patient: 'Miguel Torres García',
      room: '109-A',
      type: 'imaging',
      category: 'TAC',
      testName: 'TAC Craneal sin contraste',
      requestDate: '17/03/2026 10:30',
      status: 'pending',
      priority: 'stat',
      requestedBy: 'Dr. Carlos Rodríguez',
      clinicalIndication: 'TCE - Glasgow 13',
    },
    {
      id: 'IMG-004',
      patient: 'Elena Jiménez Ruiz',
      room: '106-B',
      type: 'imaging',
      category: 'Resonancia',
      testName: 'RM Columna Lumbar',
      requestDate: '17/03/2026 07:00',
      status: 'pending',
      priority: 'routine',
      requestedBy: 'Dr. Juan Pérez',
      clinicalIndication: 'Lumbalgia crónica',
    },
    {
      id: 'IMG-005',
      patient: 'Francisco López Sanz',
      room: '111-B',
      type: 'imaging',
      category: 'Ecografía',
      testName: 'Eco Doppler Miembros Inferiores',
      requestDate: '17/03/2026 11:00',
      resultDate: '17/03/2026 15:30',
      status: 'critical',
      priority: 'urgent',
      requestedBy: 'Dra. Ana Martínez',
      clinicalIndication: 'Sospecha TVP',
      imageFindings: 'HALLAZGOS CRÍTICOS: Trombosis venosa profunda en vena femoral común izquierda con extensión a vena poplítea. No se observa flujo en el segmento afectado.',
    },
  ]);

  const getFilteredTests = () => {
    let filtered = allTests;

    if (activeTab !== 'all') {
      filtered = filtered.filter(test => test.type === activeTab);
    }

    if (showOnlyCritical) {
      filtered = filtered.filter(test => test.status === 'critical');
    }

    // Filtrar por rol
    if (currentRole === 'TCAE') {
      // TCAE solo ve alertas críticas
      filtered = filtered.filter(test => test.status === 'critical');
    }

    return filtered;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      stat: 'bg-red-500 text-white',
      urgent: 'bg-orange-500 text-white',
      routine: 'bg-gray-400 text-white',
    };

    const labels = {
      stat: 'STAT',
      urgent: 'URGENTE',
      routine: 'RUTINARIA',
    };

    return (
      <span className={`px-2 py-0.5 text-xs rounded font-medium ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };

    const labels = {
      pending: 'Pendiente',
      completed: 'Completada',
      critical: 'CRÍTICO',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getParameterIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const filteredTests = getFilteredTests();
  const criticalCount = allTests.filter(t => t.status === 'critical').length;
  const pendingCount = allTests.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pruebas Diagnósticas</h1>
          <p className="text-muted-foreground">
            Laboratorio y diagnóstico por la imagen
          </p>
        </div>

        {currentRole === 'Médico/a' && (
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium">
            <FileText className="w-4 h-4" />
            Solicitar Prueba
          </button>
        )}
      </div>

      {/* Alertas críticas destacadas */}
      {criticalCount > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-900 font-semibold">
                {criticalCount} {criticalCount === 1 ? 'Resultado Crítico' : 'Resultados Críticos'}
              </h3>
              <p className="text-red-700 text-sm">
                Requieren atención médica inmediata
              </p>
            </div>
            <button
              onClick={() => setShowOnlyCritical(!showOnlyCritical)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex-shrink-0"
            >
              {showOnlyCritical ? 'Ver Todas' : 'Ver Solo Críticas'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Pruebas Pendientes</p>
              <h3 className="text-foreground text-2xl font-bold">{pendingCount}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Resultados Críticos</p>
              <h3 className="text-foreground text-2xl font-bold">{criticalCount}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Total Pruebas Hoy</p>
              <h3 className="text-foreground text-2xl font-bold">{allTests.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TestTube className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros por tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Todas ({allTests.length})
        </button>
        <button
          onClick={() => setActiveTab('laboratory')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'laboratory'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <TestTube className="w-4 h-4" />
          Laboratorio ({allTests.filter(t => t.type === 'laboratory').length})
        </button>
        <button
          onClick={() => setActiveTab('imaging')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'imaging'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Scan className="w-4 h-4" />
          Imagen ({allTests.filter(t => t.type === 'imaging').length})
        </button>
      </div>

      {/* Lista de pruebas */}
      <div className="space-y-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className={`bg-card border rounded-lg p-4 lg:p-6 transition-all ${
              test.status === 'critical'
                ? 'border-red-300 bg-red-50 shadow-lg'
                : 'border-border hover:shadow-md'
            }`}
          >
            {/* Header de la prueba */}
            <div className="flex flex-col lg:flex-row items-start justify-between mb-4 gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg flex-shrink-0 ${
                  test.type === 'laboratory' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {test.type === 'laboratory' ? (
                    <TestTube className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Scan className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-foreground font-semibold">{test.testName}</h3>
                    {getPriorityBadge(test.priority)}
                    {test.status === 'critical' && (
                      <span className="px-2 py-0.5 text-xs rounded bg-red-500 text-white animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ALERTA CRÍTICA
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{test.patient}</span>
                    <span>• Hab. {test.room}</span>
                    <span>• {test.category}</span>
                    <span>• ID: {test.id}</span>
                  </div>
                </div>
              </div>
              <div className="lg:ml-auto">
                {getStatusBadge(test.status)}
              </div>
            </div>

            {/* Info de solicitud */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span className="text-muted-foreground">Solicitada por:</span>
                <p className="text-foreground font-semibold">{test.requestedBy}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha solicitud:</span>
                <p className="text-foreground font-semibold">{test.requestDate}</p>
              </div>
              {test.resultDate && (
                <div>
                  <span className="text-muted-foreground">Fecha resultado:</span>
                  <p className="text-foreground font-semibold">{test.resultDate}</p>
                </div>
              )}
            </div>

            {test.clinicalIndication && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-900 font-semibold">Indicación clínica: </span>
                <span className="text-sm text-blue-800">{test.clinicalIndication}</span>
              </div>
            )}

            {/* Resultados de laboratorio */}
            {test.results && test.results.length > 0 && (
              <div className="border border-border rounded-lg overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Parámetro</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Valor</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Rango Normal</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {test.results.map((result, idx) => (
                      <tr key={idx} className={`border-t border-border ${
                        result.status === 'critical' ? 'bg-red-50' : ''
                      }`}>
                        <td className="p-3 text-sm text-foreground font-semibold">
                          {result.parameter}
                        </td>
                        <td className={`p-3 text-sm font-semibold ${
                          result.status === 'critical' ? 'text-red-600' :
                          result.status === 'high' || result.status === 'low' ? 'text-orange-600' :
                          'text-foreground'
                        }`}>
                          {result.value} {result.unit}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {result.normalRange} {result.unit}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getParameterIcon(result.status)}
                            <span className={`text-sm font-medium ${
                              result.status === 'critical' ? 'text-red-600' :
                              result.status === 'high' || result.status === 'low' ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {result.status === 'critical' ? 'CRÍTICO' :
                               result.status === 'high' ? 'Alto' :
                               result.status === 'low' ? 'Bajo' :
                               'Normal'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Hallazgos de imagen */}
            {test.imageFindings && (
              <div className={`p-4 rounded-lg border ${
                test.status === 'critical'
                  ? 'bg-red-100 border-red-300'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  test.status === 'critical' ? 'text-red-900' : 'text-foreground'
                }`}>
                  Hallazgos:
                </h4>
                <p className={`text-sm ${
                  test.status === 'critical' ? 'text-red-800' : 'text-foreground'
                }`}>
                  {test.imageFindings}
                </p>
              </div>
            )}

            {/* Acciones */}
            {currentRole === 'Médico/a' && (
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                <button className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Ver Detalles Completos
                </button>
                {test.status === 'pending' && (
                  <button className="text-sm px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium">
                    Cancelar Solicitud
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block p-4 bg-muted rounded-full mb-4">
            <TestTube className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No hay pruebas {showOnlyCritical ? 'críticas' : ''} disponibles en este momento
          </p>
        </div>
      )}
    </div>
  );
}
