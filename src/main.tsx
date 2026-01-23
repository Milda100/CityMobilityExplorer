import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import MapPage from './MapPage.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes = "still fresh"
      gcTime: 30 * 60 * 1000,        // keep cache 30 min
      refetchOnWindowFocus: false,   // maps ≠ refocus spam
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MapPage />
    </QueryClientProvider>
  </StrictMode>,
)
