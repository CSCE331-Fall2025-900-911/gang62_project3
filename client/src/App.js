import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SignIn from './components/SignIn/SignIn';
import Kiosk from './components/Kiosk/Kiosk';
import Checkout from './components/CheckoutPage/Checkout';
import Dashboard from './components/ManagerDashboard/Dashboard';
import CashierDashboard from './components/ManagerDashboard/CashierDashboard';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          // Check if user is authenticated and is an admin
          if (!user || (!user.isAdmin && user.role !== 'admin')) {
            // Not an admin, redirect to login
            setIsAuthorized(false);
            navigate('/', { replace: true });
            return;
          }
          
          // User is admin, allow access
          setIsAuthorized(true);
        } else {
          // Not authenticated, redirect to login
          setIsAuthorized(false);
          navigate('/', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Failed to verify admin access:', error);
        setIsAuthorized(false);
        navigate('/', { replace: true });
        return;
      } 
    };

    checkAdminAccess();
  }, [navigate]);

  const handleLocalLogin = (localUser = null) => {
    setUser(localUser);
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/"
          element={<SignIn onLogin={handleLocalLogin} />}
        />
        <Route 
          path="/signin"
          element={<Navigate to="/" replace />}
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
          element={
            isAuthorized ? (
              <Dashboard user={user} />
            ) : 
              <Navigate to="/" replace />
          }
        />
        <Route
          path="/cashier"
          element={
            <CashierDashboard user={user} />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;