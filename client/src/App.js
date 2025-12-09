// import React, { useEffect, useState, useCallback } from 'react';
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SignIn from './components/SignIn/SignIn';
import Kiosk from './components/Kiosk/Kiosk';
import Checkout from './components/CheckoutPage/Checkout';
import Dashboard from './components/ManagerDashboard/Dashboard';
import CashierDashboard from './components/ManagerDashboard/CashierDashboard';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function AppContent() {
  const [user, setUser] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  

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
            !isAdmin ? (
              <div />
            ) : user && (user.isAdmin || user.role === 'admin') ? (
              <Dashboard user={user} />
            ) : (
              <Navigate to="/" />
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