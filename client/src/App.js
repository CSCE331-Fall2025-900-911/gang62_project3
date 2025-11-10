import React from 'react';


import './App.css';
import SignIn from './components/SignIn';
import Checkout from './components/Checkout';
// import Kiosk from './components/Kiosk';

function App() {
  return (
    <div className="App">
      {/* <Kiosk></Kiosk> */}
      <Checkout></Checkout>
      
    </div>
  );
}

export default App;
