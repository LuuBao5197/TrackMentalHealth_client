import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Suspense fallback={<div>Loading...</div>}>
        <GoogleOAuthProvider clientId="475298958238-0o73hjtvus1isu9t4f2k13n5ifnia68e.apps.googleusercontent.com">
          <BrowserRouter basename='/TrackMentalHealth'>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </Suspense>
    </PersistGate>
  </Provider>
);
