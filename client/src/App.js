import React from 'react';


import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import Kiosk from './components/Kiosk';
import Checkout from './components/Checkout';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<SignIn onLogin={() => setIsAuthenticated(true)} />} 
          />
          <Route 
            path="/kiosk" 
            element={
              isAuthenticated ? (
                <Kiosk 
                  orderItems={orderItems}
                  setOrderItems={setOrderItems}
                  orderTotal={orderTotal}
                  setOrderTotal={setOrderTotal}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/checkout" 
            element={
              isAuthenticated ? (
                <Checkout 
                  orderItems={orderItems}
                  orderTotal={orderTotal}
                />
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
