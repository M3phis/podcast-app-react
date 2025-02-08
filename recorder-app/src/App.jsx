import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Studio from './Pages/Studio';
import Dashboard from './Pages/Dashboard';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/studio" element={<Studio />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
