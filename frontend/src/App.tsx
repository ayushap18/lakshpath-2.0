import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Icon from './components/ui/Icon'
import { ToastProvider } from './contexts/ToastContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

// Lazy load all page components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'))
const QuizIntro = lazy(() => import('./pages/QuizIntro'))
const Assessment = lazy(() => import('./pages/Assessment'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Chat = lazy(() => import('./pages/Chat'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Interview = lazy(() => import('./pages/Interview'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Market = lazy(() => import('./pages/Market'))
const Profile = lazy(() => import('./pages/Profile'))
const NSQF = lazy(() => import('./pages/NSQF'))
const MicroCoach = lazy(() => import('./pages/MicroCoach'))
const CareerDNA = lazy(() => import('./pages/CareerDNA'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const SkillSimulator = lazy(() => import('./pages/SkillSimulator'))
const PlacementPrep = lazy(() => import('./pages/PlacementPrep'))
const AILive = lazy(() => import('./pages/AILive'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Admin = lazy(() => import('./pages/Admin'))

// Loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
    <motion.div
      className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.1), rgba(139,92,246,0.08))', border: '1px solid rgba(13,162,231,0.15)' }}
      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon name="conversion_path" size={24} className="text-accent" />
    </motion.div>
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-accent/40" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  </div>
)

// Redirect logged-in users away from auth pages
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token'); // AuthContext not yet mounted here; safe localStorage read

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Clear any token that is clearly expired (JWT exp claim is too far in the past).
    // The server will 401 on first request anyway — this just avoids a stale redirect loop.
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.clear();
          window.location.href = '/login';
        }
      } catch {
        // Non-JWT token — leave it; the auth interceptor will handle 401
      }
    }
  }, []);

  return (
    <ErrorBoundary>
    <AuthProvider>
    <ToastProvider>
    <SubscriptionProvider>
    <Router>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Auth Routes */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        {/* Protected full-screen routes (no AppShell) */}
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/quiz-intro" element={<ProtectedRoute><QuizIntro /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />

        {/* Admin route */}
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><AppShell /></AdminRoute></ProtectedRoute>}>
          <Route index element={<Admin />} />
        </Route>

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
      </Suspense>
    </Router>
    </SubscriptionProvider>
    </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
