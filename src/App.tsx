import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function DashboardRouter() {
  const { user, isAuthenticated } = useAuth();

  // If user is not authenticated, show the Login/Signup page first
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  // Once authenticated, show role-specific dashboard
  switch (user.role) {
    case 'citizen':
      return <CitizenDashboard onOpenAuthModal={() => {}} />;
    case 'officer':
      return <OfficerDashboard onOpenAuthModal={() => {}} />;
    case 'admin':
      return <AdminDashboard onOpenAuthModal={() => {}} />;
    default:
      return <AuthPage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardRouter />
    </AuthProvider>
  );
}
