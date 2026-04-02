import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import FacultyLogin from './pages/FacultyLogin';
import ManagementLogin from './pages/ManagementLogin';
import Landing from './pages/Landing';
import Register from './pages/Register';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HODDashboard from './pages/HODDashboard';
import ActivitySubmit from './pages/ActivitySubmit';
import ProfessorDetail from './pages/ProfessorDetail';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
    return <Navigate to="/" replace />; // Redirect to their default dashboard
  }

  return children;
};

// Main Routing Logic based on Role
const HomeRouter = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  if (user.role === 'Admin') {
    return <AdminDashboard />;
  } else if (user.role === 'HOD') {
    return <HODDashboard />;
  } else {
    return <FacultyDashboard />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/faculty-login" element={<FacultyLogin />} />
        <Route path="/management-login" element={<ManagementLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Dynamic Home based on Role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeRouter />
            </ProtectedRoute>
          }
        />

        {/* Activity Submission (Faculty/HOD) */}
        <Route
          path="/submit"
          element={
            <ProtectedRoute allowedRoles={['Faculty', 'HOD', 'Admin']}>
              <ActivitySubmit />
            </ProtectedRoute>
          }
        />

        {/* Professor Insight View (Admin/HOD) */}
        <Route
          path="/professor/:id"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HOD']}>
              <ProfessorDetail />
            </ProtectedRoute>
          }
        />



        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
