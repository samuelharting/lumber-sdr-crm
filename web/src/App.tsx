import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './components/DashboardPage';
import LeadsPage from './components/LeadsPage';
import LeadDetailPage from './components/LeadDetailPage';
import './style.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Navigate to="/dashboard" replace /></Layout>} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/leads" element={<Layout><LeadsPage /></Layout>} />
          <Route path="/leads/:id" element={<Layout><LeadDetailPage /></Layout>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;