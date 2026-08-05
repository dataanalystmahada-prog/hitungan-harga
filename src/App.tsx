import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { KalkulatorPage } from './pages/KalkulatorPage';
import { KalkulatorManualPage } from './pages/KalkulatorManualPage';
import { PerhitunganPage } from './pages/PerhitunganPage';
import { SPHPage } from './pages/SPHPage';
import { MasterDataPage } from './pages/MasterDataPage';
import { SyncMonitorPage } from './pages/SyncMonitorPage';
import { PromptLibraryPage } from './pages/PromptLibraryPage';

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
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
    </QueryClientProvider>
  );
}

export default App;
