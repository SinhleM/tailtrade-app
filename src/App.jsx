import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TailTradeHomePage from './Components/HomePage.jsx'
import LoginRegister from './Components/LoginRegister.jsx'
import './App.css'



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TailTradeHomePage />} />
        <Route path="/login" element={<LoginRegister />} />
      </Routes>
    </Router>
  );
}

export default App