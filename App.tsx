import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import QueriesView from './pages/QueriesView';
import SchedulesView from './pages/SchedulesView';
import DistributionsView from './pages/DistributionsView';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/queries" element={<QueriesView />} />
          <Route path="/schedules" element={<SchedulesView />} />
          <Route path="/distributions" element={<DistributionsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
