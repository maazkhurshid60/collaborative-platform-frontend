import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import store from './redux/store.ts'
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/errorBoundary/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Optional reset logic
          window.location.reload();
        }}
      >
        <App />
      </ErrorBoundary>
    </Provider>
  </StrictMode>
)
