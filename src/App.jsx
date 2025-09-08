// App.jsx
"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Header from "./components/Header/Header"
import HeroSection from "./components/HeroSection/HeroSection"
import HowItWorks from "./components/HowItWorks/HowItWorks"
import AboutUs from "./components/AboutUs/AboutUs"
import Testimonials from "./components/Testimonials/Testimonials"
import FAQ from "./components/FAQ/FAQ"
import Footer from "./components/Footer/Footer"
import Genres from "./components/Genres/Genres"
import AllMovies from "./pages/Movies/Pages/AllMovies"
import SingleMovie from "./pages/Movies/Pages/SingleMovie" // Import SingleMovie

// pages
import Movies from "./pages/Movies/Movies"
import Moderation from "./pages/Moderation/Moderation"
import SignIn from "./pages/Sign-In/SignIn"
import SignUp from "./pages/Sign-Up/SignUp"
import UserProfile from "./pages/UserProfile/UserProfile"
import NotFound from "./pages/404/NotFound"
import VerificationPending from "./pages/Pending Verifiction/VerificationPending"
import EmailVerification from "./pages/Email/EmailVerification"

import ProtectedRoute from "./components/ProtectedRoute"
import "./App.css"
import Favorites from "./pages/Favorites/Favorites"

// Home page sections
const Home = () => (
  <>
    <HeroSection />
    <HowItWorks />
    <AboutUs />
    <Genres />
    <Testimonials />
    <FAQ />
  </>
)

// Wrapper to use hooks like useNavigate
const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const navigate = useNavigate()

  // Load from localStorage on first load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("userData")
      const token = localStorage.getItem("token")

      if (storedUser && token) {
        setIsLoggedIn(true)
        setUser(JSON.parse(storedUser))
      }
      
      setIsAuthLoading(false)
    }
    
    checkAuth()
  }, [])

  // Handle login
  const handleLogin = (userData) => {
    setIsLoggedIn(true)
    setUser(userData)
    localStorage.setItem("userData", JSON.stringify(userData))
    navigate("/movies")
  }

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.removeItem("userData")
    localStorage.removeItem("token")
    navigate("/")
  }

  // Don't render routes until authentication check is complete
  if (isAuthLoading) {
    return (
      <div className="loading-authentication">
        {/* You can add a loading spinner here if desired */}
      </div>
    )
  }

  return (
    <div className="app">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/allmovies" element={<AllMovies />} />
          <Route path="/community" element={<Moderation />} />

          {/* Auth routes */}
          <Route path="/signin" element={isLoggedIn ? <Navigate to="/movies" replace /> : <SignIn onLogin={handleLogin} />} />
          <Route path="/signup" element={isLoggedIn ? <Navigate to="/" replace /> : <SignUp onSignup={handleLogin} />} />
          <Route path="/verificationpending" element={<VerificationPending />} />
          <Route path="/verify/:token" element={<EmailVerification onLogin={handleLogin} />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute isAuthenticated={isLoggedIn} />}>
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="/movie/:movieId" element={<SingleMovie />} />
            <Route path="/favorites" element={<Favorites user={user} />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

const App = () => (
  <Router>
    <AppContent />
  </Router>
)

export default App