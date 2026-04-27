import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/hospital/Sidebar';
import { Header } from '@/components/hospital/Header';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PatientsPage from '@/pages/PatientsPage';
import BedMapPage from '@/pages/BedMapPage';
import NotificationsPage from '@/pages/NotificationsPage';
import DiagnosticTestsPage from '@/pages/DiagnosticTestsPage';
import UnifiedHistoryPage from '@/pages/UnifiedHistoryPage';
import NursePage from '@/pages/NursePage';
import TCAEPage from '@/pages/TCAEPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

/** Full-page layout: sidebar + header + main content */
function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected layout */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"     element={<DashboardPage />} />
<Route path="/patients"          element={<PatientsPage />} />
            <Route path="/patients/:patientId" element={<PatientsPage />} />
            <Route path="/beds"          element={<BedMapPage />} />
            <Route path="/nurse"         element={<NursePage />} />
            <Route path="/vitals"        element={<TCAEPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/tests"         element={<DiagnosticTestsPage />} />
            <Route path="/history"       element={<UnifiedHistoryPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
