
/// <reference types="react" />

import React from 'react';
import { ToastProvider } from './components/ToastContext';

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Dashboard from './screens/DashboardScreen';
import CreateList from './screens/CreateList';
import ListDetails from './screens/ListDetails';
import History from './screens/History';
import Profile from './screens/Profile';
import Finances from './screens/Finances';
import AdminDashboard from './screens/AdminDashboard';

import { SubscriptionProvider } from './components/SubscriptionContext';

const App: React.FC = () => {
  return (
    <SubscriptionProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lists" element={<Dashboard />} />
            <Route path="/create-list" element={<CreateList />} />
            <Route path="/list-details/:id" element={<ListDetails />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </ToastProvider>
    </SubscriptionProvider>
  );
};

export default App;
