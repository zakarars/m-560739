
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Add error handler to detect rendering and loading errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Check if it's a module loading error (which is common with dynamic imports)
  if (event.error && event.error.message && event.error.message.includes('Failed to fetch dynamically imported module')) {
    console.error('Module loading error detected. This might be fixed by refreshing the page.');
    
    // Update the root element with a helpful error message
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 40px; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
          <h1 style="margin-bottom: 16px; color: #e11d48;">Module Loading Error</h1>
          <p style="margin-bottom: 24px; line-height: 1.5;">
            We couldn't load one of the required modules. This can happen due to network issues or browser caching.
          </p>
          <button 
            style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;"
            onclick="window.location.reload(true)"
          >
            Refresh Page
          </button>
        </div>
      `;
    }
  }
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render the app:', error);
  
  // Render a basic error message if the app fails to render
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="margin-bottom: 16px; color: #e11d48;">Something went wrong</h1>
        <p style="margin-bottom: 24px; line-height: 1.5;">
          The application failed to load. Please try refreshing the page.
        </p>
        <p style="font-family: monospace; background: #f1f5f9; padding: 16px; text-align: left; border-radius: 4px; margin-bottom: 24px; overflow-x: auto;">
          ${error instanceof Error ? error.message : String(error)}
        </p>
        <button 
          style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;"
          onclick="window.location.reload(true)"
        >
          Refresh Page
        </button>
      </div>
    `;
  }
}
