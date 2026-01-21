
/// <reference types="react" />

import React from 'react';
import { ToastProvider } from './components/ToastContext';

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import CreateList from './screens/CreateList';
import ListDetails from './screens/ListDetails';
import History from './screens/History';
import Profile from './screens/Profile';
import Finances from './screens/Finances';

const App: React.FC = () => {
  return (
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
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;
