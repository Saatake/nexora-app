import { type ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ConfirmEmailPage from '../pages/ConfirmEmailPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import MyProjectsPage from '../pages/MyProjectsPage';
import NewProjectPage from '../pages/NewProjectPage';
import EditProjectPage from '../pages/EditProjectPage';
import ExploreProjectsPage from '../pages/ExploreProjectsPage';
import RankingPage from '../pages/RankingPage';
import ProfilePage from '../pages/ProfilePage';
import ProjectDetailsPage from '../pages/ProjectDetailsPage';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <PrivateRoute>
              <MyProjectsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/projects/new" 
          element={
            <PrivateRoute>
              <NewProjectPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/projects/:id/edit" 
          element={
            <PrivateRoute>
              <EditProjectPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/projects/:id" 
          element={
            <PrivateRoute>
              <ProjectDetailsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/explore" 
          element={
            <PrivateRoute>
              <ExploreProjectsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ranking" 
          element={
            <PrivateRoute>
              <RankingPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile/:id" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
