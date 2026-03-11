import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App.tsx';
import './index.css';
import { initAnalytics } from './lib/analytics';

initAnalytics();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId && import.meta.env.DEV) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.');
}

const RootApp = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{RootApp}</React.StrictMode>,
);
