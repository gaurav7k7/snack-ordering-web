import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { App } from '@/app/App';
import { PageLoader } from '@/components/shared/PageLoader';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { store } from '@/redux/store';
import { registerServiceWorker } from '@/utils/registerServiceWorker';
import '@/styles/globals.css';

registerServiceWorker();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader fullScreen />}>
              <App />
            </Suspense>
            <Toaster position="top-right" />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>,
);
