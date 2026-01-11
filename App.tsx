
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import CreateList from './screens/CreateList';
import ListDetails from './screens/ListDetails';
import ShoppingMode from './screens/ShoppingMode';
import History from './screens/History';
import Profile from './screens/Profile';
import Finances from './screens/Finances';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lists" element={<Dashboard />} />
        <Route path="/create-list" element={<CreateList />} />
        <Route path="/list-details/:id" element={<ListDetails />} />
        <Route path="/shopping-mode/:id" element={<ShoppingMode />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
