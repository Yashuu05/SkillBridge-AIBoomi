// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      console.log('Navbar - Auth state:', currentUser ? currentUser.email : 'No user');
    });
    
    return () => unsubscribe();
  }, []);

  // Navigation items - conditionally show based on auth state
  const navItems = [
    { path: '/', label: 'Home', showAlways: true },
    { path: '/assessment', label: 'Assessment', requiresAuth: true },
    { path: '/profile', label: 'Profile', requiresAuth: true }, // ADDED THIS LINE
    { path: '/skill-result', label: 'Results', requiresAuth: true },
    { path: '/coach-recommendation', label: 'Coaches', requiresAuth: true },
    { path: '/training-plan', label: 'Training', requiresAuth: true },
  ];

  // Filter navigation items based on auth state
  const filteredNavItems = navItems.filter(item => {
    if (item.showAlways) return true;
    if (item.requiresAuth && user) return true;
    return false;
  });

  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      await signOut(auth);
      console.log('Logout successful');
      
      localStorage.removeItem('user');
      navigate('/login');
      alert('Logged out successfully!');
      
    } catch (error) {
      console.error('Logout error:', error);
      alert(`Logout failed: ${error.message}`);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  // Show loading state
  if (loading) {
    return (
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-8 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                SkillBridge
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm text-gray-300 font-medium truncate max-w-[120px]">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.uid.substring(0, 8)}...
                    </p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all duration-200 hover:shadow-lg flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 hover:bg-gray-800/30 rounded-lg"
                >
                  Sign In
                </button>
                
                {/* Sign Up Button */}
                <button
                  onClick={handleSignup}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all duration-200 hover:shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden mt-3">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile User Info */}
          {user && (
            <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate max-w-[150px]">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;