import { useState } from 'react';
import {
  Sidebar,
  Header,
  DashboardOverview,
  MedicalSchedule,
  ShiftReport,
  UnifiedHistory,
  RealtimeNotifications,
  QuickActions,
  DiagnosticTests,
  BedMap,
} from '../app/components/hospital';
import { ProtectedRoute } from '../app/components/auth/ProtectedRoute';
export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Médico/a');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(3);

  const renderMainContent = () => {
    switch (activeSection) {
      case 'bed-map':
        return <BedMap currentRole={currentRole} />;
      case 'tests':
        return <DiagnosticTests currentRole={currentRole} />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Panel de Control - {currentRole}</h1>
              <p className="text-muted-foreground">
                Vista centralizada de todas las operaciones en tiempo real
              </p>
            </div>

            <DashboardOverview currentRole={currentRole} />

            <MedicalSchedule currentRole={currentRole} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ShiftReport currentRole={currentRole} />
              </div>
              <div>
                <QuickActions currentRole={currentRole} />
              </div>
            </div>

            <UnifiedHistory currentRole={currentRole} />
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-background">
        {/* Sidebar - Hidden on mobile, shown on md+ */}
        <div className="hidden md:block">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            notifications={notificationCount}
            onNotificationsClick={() => setShowNotifications(!showNotifications)}
          />

          {/* Mobile Navigation */}
          <div className="md:hidden p-4 bg-card border-b border-border">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'bed-map', label: 'Camas' },
                { id: 'tests', label: 'Pruebas' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <RealtimeNotifications
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {renderMainContent()}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-card border-t border-border px-6 py-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">NexoMed</span>
                <span>•</span>
                <span>Sistema de Gestión Clínica</span>
              </div>
              <div className="flex items-center gap-4">
                <span>© 2026 Hospital</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">v1.0.0</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}