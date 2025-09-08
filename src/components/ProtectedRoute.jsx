"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useState, useEffect } from "react"

// Enhanced component to handle protected routes with loading state
const ProtectedRoute = ({ isAuthenticated, redirectPath = "/signin", children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage for authentication token
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    
    if (token && userData) {
      setIsLocallyAuthenticated(true);
    }
    
    setAuthChecked(true);
  }, []);

  // Show nothing during the authentication check
  if (!authChecked) {
    return null; // Or a loading spinner if you prefer
  }

  // Use either props-based authentication or localStorage-based authentication
  if (!isAuthenticated && !isLocallyAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute
