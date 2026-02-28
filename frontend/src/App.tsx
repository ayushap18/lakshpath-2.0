import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ProfileSetup from './pages/ProfileSetup'
import QuizIntro from './pages/QuizIntro'
import Assessment from './pages/Assessment'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Roadmap from './pages/Roadmap'
import Interview from './pages/Interview'
import Portfolio from './pages/Portfolio'
import Market from './pages/Market'
import Profile from './pages/Profile'
import NSQF from './pages/NSQF'
import MicroCoach from './pages/MicroCoach'
import CareerDNA from './pages/CareerDNA'
import ResumeBuilder from './pages/ResumeBuilder'
import SkillSimulator from './pages/SkillSimulator'
import PlacementPrep from './pages/PlacementPrep'
import AILive from './pages/AILive'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

// Redirect logged-in users away from auth pages
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token.startsWith('mock-jwt-token-')) {
      const tokenParts = token.split('-');
      const timestamp = parseInt(tokenParts[tokenParts.length - 1]);
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      if (timestamp < weekAgo) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        {/* Protected full-screen routes (no AppShell) */}
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/quiz-intro" element={<ProtectedRoute><QuizIntro /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />

        {/* Protected routes inside AppShell */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/learn" element={<Roadmap />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/market" element={<Market />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/nsqf" element={<NSQF />} />
          <Route path="/micro-coach" element={<MicroCoach />} />
          <Route path="/career-dna" element={<CareerDNA />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/skill-simulator" element={<SkillSimulator />} />
          <Route path="/placement-prep" element={<PlacementPrep />} />
          <Route path="/ai-live" element={<AILive />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
