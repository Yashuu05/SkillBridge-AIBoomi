// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Assessment from './pages/Assessment';
import SkillResult from './pages/SkillResult';
import CoachRecommendation from './pages/CoachRecommendation';
import TrainingPlan from './pages/TrainingPlan';
import CoachingForm from './pages/CoachingForm'; // Add this import
import Navbar from './components/Navbar';

// Custom hook for authentication state
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth State Changed:', currentUser ? currentUser.email : 'No user');
      setUser(currentUser);
      setLoading(false);
      
      // Store user info in sessionStorage (cleared on browser close)
      if (currentUser) {
        sessionStorage.setItem('user', JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        }));
      } else {
        sessionStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full"></div>
        <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-6 text-gray-400 text-lg font-medium">Loading SkillBridge...</p>
      <p className="mt-2 text-gray-600 text-sm">Preparing your experience</p>
    </div>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

// Public Route Wrapper (no auth required)
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is already logged in, redirect from auth pages
  const isAuthPage = ['/login', '/signup', '/'].includes(window.location.pathname);
  if (user && isAuthPage) {
    return <Navigate to="/assessment" replace />;
  }

  return <Outlet />;
};

// Layout with Navbar
const MainLayout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar user={user} />
      <main className="pt-16"> {/* Adjust based on your Navbar height */}
        {children}
      </main>
    </div>
  );
};

// Auth Layout (no Navbar for login/signup)
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {children}
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes - No Navbar */}
        <Route element={<AuthLayout><Outlet /></AuthLayout>}>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Route>

        {/* Protected Routes with Navbar */}
        <Route element={<MainLayout><Outlet /></MainLayout>}>
          <Route element={<ProtectedRoute />}>
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/skill-result" element={<SkillResult />} />
            <Route path="/coaching-form" element={<CoachingForm />} />
            <Route path="/coach-recommendation" element={<CoachRecommendation />} />
            <Route path="/training-plan" element={<TrainingPlan />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Development Debug Footer */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 text-xs text-gray-400 p-2 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded ${auth?.app?.name ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                Firebase: {auth?.app?.name ? '✅' : '❌'}
              </span>
              <span className="px-2 py-1 rounded bg-blue-900/30 text-blue-400">
                Env: {process.env.NODE_ENV}
              </span>
              <span className="hidden md:inline text-gray-500">
                Routes: Protected({['/assessment', '/coach-recommendation', '/training-plan'].length}) | Public({['/', '/login', '/signup'].length})
              </span>
            </div>
            <div className="text-gray-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;