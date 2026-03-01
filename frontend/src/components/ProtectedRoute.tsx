import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Paths that are part of onboarding — exempt from redirect loops
const ONBOARDING_PATHS = ['/profile-setup', '/quiz-intro', '/assessment'];

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentPath = location.pathname;

  // Skip onboarding enforcement for onboarding pages themselves
  if (!ONBOARDING_PATHS.includes(currentPath)) {
    const profileCompleted = localStorage.getItem('profileSetupCompleted');
    if (profileCompleted !== 'true') {
      return <Navigate to="/profile-setup" replace />;
    }

    const assessmentCompleted = localStorage.getItem('assessmentCompleted');
    if (assessmentCompleted !== 'true') {
      return <Navigate to="/quiz-intro" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
