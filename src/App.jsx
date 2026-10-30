import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RequireAuth from './components/RequireAuth';
import GraphExplorer from './pages/GraphExplorer';
import AdminPanel from './pages/AdminPanel';
import Auth from './pages/Auth'; 

// 👇 Naye premium pages import kar liye
import Machines from './pages/Machines';
import Incidents from './pages/Incidents';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Ab naya premium page khulega */}
        <Route path="/login" element={<Auth />} />
    
        {/* Protected Routes (IEG Command Center) */}
        <Route path="/" element={
          <RequireAuth>
            <Layout><Dashboard /></Layout>
          </RequireAuth>
        } />
        
        <Route path="/machines" element={
          <RequireAuth>
            <Layout><Machines /></Layout> {/* 👈 Div hata kar asli component laga diya */}
          </RequireAuth>
        } />
        
        <Route path="/incidents" element={
          <RequireAuth>
            <Layout><Incidents /></Layout> {/* 👈 Div hata kar asli component laga diya */}
          </RequireAuth>
        } />

        <Route path="/graph" element={
          <RequireAuth>
            <Layout><GraphExplorer /></Layout>
          </RequireAuth>
        } />

        <Route path="/admin" element={
          <RequireAuth>
            <Layout><AdminPanel /></Layout>
          </RequireAuth>
        } />
      </Routes>
    </Router>
  );
}

export default App;