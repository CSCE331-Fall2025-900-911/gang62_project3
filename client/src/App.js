import React, { useEffect, useState } from 'react';

import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn/SignIn';
import Kiosk from './components/Kiosk/Kiosk';
import Checkout from './components/CheckoutPage/Checkout';
import Dashboard from './components/ManagerDashboard/Dashboard';
import CashierDashboard from './components/ManagerDashboard/CashierDashboard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(Boolean(data.user));
          setUser(data.user || null);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to verify session', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    checkSession();
  }, []);

  const handleLocalLogin = (localUser = null) => {
    setIsAuthenticated(true);
    setAuthChecked(true);
    setUser(localUser);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route 
            path="/"
            element={<SignIn onLogin={handleLocalLogin} />}
          />
          <Route 
            path="/kiosk"
            element={
              <Kiosk 
                orderItems={orderItems}
                setOrderItems={setOrderItems}
                orderTotal={orderTotal}
                setOrderTotal={setOrderTotal}
                user={user}
                ttsEnabled={ttsEnabled}
                setTtsEnabled={setTtsEnabled}
              />
            }
          />
          <Route 
            path="/checkout"
            element={
              <Checkout 
                orderItems={orderItems}
                setOrderItems={setOrderItems}
                orderTotal={orderTotal}
                setOrderTotal={setOrderTotal}
                user={user}
                ttsEnabled={ttsEnabled}
              />
            }
          />
          <Route
            path="/manager"
            element={ <SignIn onLogin={handleLocalLogin} /> }
          />
          <Route
            path="/cashier"
            element={
              !authChecked ? (
                <div />
              ) : isAuthenticated ? (
                <CashierDashboard user={user} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;