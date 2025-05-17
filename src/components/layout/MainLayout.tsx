
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Briefcase, Home, Calendar, Settings } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser, userData, logout, isEmployer } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary text-white' : 'hover:bg-primary/10';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-job-teal" />
            <span className="text-2xl font-bold gradient-text">JobBoard</span>
          </Link>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2"
                  asChild
                >
                  <Link to="/dashboard">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => logout()}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth?mode=login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/auth?mode=register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex">
        {/* Sidebar - shown only when logged in */}
        {currentUser && (
          <aside className="w-20 md:w-64 bg-sidebar shadow-md flex-shrink-0">
            <nav className="p-4 space-y-6">
              <div className="space-y-2">
                <div className="text-sidebar-foreground/70 font-medium text-xs uppercase tracking-wider hidden md:block">
                  Main
                </div>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/" 
                      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${isActive('/')}`}
                    >
                      <Home className="w-5 h-5" />
                      <span className="hidden md:inline">Home</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/jobs" 
                      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${isActive('/jobs')}`}
                    >
                      <Briefcase className="w-5 h-5" />
                      <span className="hidden md:inline">Jobs</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${isActive('/dashboard')}`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="hidden md:inline">
                        {isEmployer ? 'Manage Jobs' : 'Applications'}
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/settings" 
                      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${isActive('/settings')}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="hidden md:inline">Settings</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Additional menu items based on role */}
              {isEmployer && (
                <div className="space-y-2">
                  <div className="text-sidebar-foreground/70 font-medium text-xs uppercase tracking-wider hidden md:block">
                    Employer
                  </div>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        to="/job/create" 
                        className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${isActive('/job/create')}`}
                      >
                        <Briefcase className="w-5 h-5" />
                        <span className="hidden md:inline">Post a Job</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </nav>
          </aside>
        )}

        {/* Content */}
        <div className="flex-grow p-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 JobBoard. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Terms</Link>
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Privacy</Link>
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
