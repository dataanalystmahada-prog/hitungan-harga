import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { KalkulatorPage } from './pages/KalkulatorPage';
import { KalkulatorManualPage } from './pages/KalkulatorManualPage';
import { PerhitunganPage } from './pages/PerhitunganPage';
import { SPHPage } from './pages/SPHPage';
import { MasterDataPage } from './pages/MasterDataPage';
import { SyncMonitorPage } from './pages/SyncMonitorPage';
import { PromptLibraryPage } from './pages/PromptLibraryPage';
import { LoginPage } from './pages/LoginPage';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<DashboardPage />} />
                    <Route path="kalkulator" element={<KalkulatorPage />} />
                    <Route path="kalkulator-manual" element={<KalkulatorManualPage />} />
                    <Route path="perhitungan" element={<PerhitunganPage />} />
                    <Route path="sph" element={<SPHPage />} />
                    <Route path="master-data" element={<MasterDataPage />} />
                    <Route path="sync-monitor" element={<SyncMonitorPage />} />
                    <Route path="prompts" element={<PromptLibraryPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
