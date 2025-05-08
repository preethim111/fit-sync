import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<div>Welcome to FitSync</div>} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App; 