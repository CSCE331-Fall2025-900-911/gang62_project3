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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          setUser(userData);
          
          // Check if user is authenticated and is an admin
          if (!userData || (!userData.isAdmin && userData.role !== 'admin')) {
            // Not an admin
            setIsAuthorized(false);
          } else {
            // User is admin, allow access
            setIsAuthorized(true);
          }
        } else {
          // Not authenticated
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Failed to verify admin access:', error);
        setIsAuthorized(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const handleLocalLogin = (localUser = null) => {
    setUser(localUser);
    if (localUser && (localUser.isAdmin || localUser.role === 'admin')) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
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
            isCheckingAuth ? (
              <div>Loading...</div>
            ) : isAuthorized ? (
              <Dashboard user={user} />
            ) : (
              <Navigate to="/" replace />
            )
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