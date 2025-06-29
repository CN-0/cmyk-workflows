import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import WorkflowBuilder from './pages/WorkflowBuilder';
import Executions from './pages/Executions';
import Users from './pages/Users';
import Templates from './pages/Templates';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" /> : <LoginForm />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workflows" 
        element={
          <ProtectedRoute>
            <Workflows />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workflows/new" 
        element={
          <ProtectedRoute>
            <WorkflowBuilder />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workflows/:id/edit" 
        element={
          <ProtectedRoute>
            <WorkflowBuilder />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/executions" 
        element={
          <ProtectedRoute>
            <Executions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/templates" 
        element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <Router>
          <AppRoutes />
        </Router>
      </WorkflowProvider>
    </AuthProvider>
  );
}

export default App;