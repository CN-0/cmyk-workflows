import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import WorkflowBuilder from './pages/WorkflowBuilder';
import EnhancedWorkflowBuilder from './pages/EnhancedWorkflowBuilder';
import Executions from './pages/Executions';
import Users from './pages/Users';
import Templates from './pages/Templates';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" /> : <LoginForm />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" /> : <RegisterForm />} 
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
            <EnhancedWorkflowBuilder />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workflows/:id/edit" 
        element={
          <ProtectedRoute>
            <EnhancedWorkflowBuilder />
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
          <ProtectedRoute requiredRole="admin">
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