
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error handler to detect rendering errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

try {
  createRoot(document.getElementById("root")!).render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render the app:', error);
  // Render a basic error message if the app fails to render
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1>Something went wrong</h1>
        <p>The application failed to load. Please check the console for details.</p>
      </div>
    `;
  }
}
