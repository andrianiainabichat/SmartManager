import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/items', icon: Package, label: 'Éléments' },
    { path: '/items/new', icon: PlusCircle, label: 'Ajouter' },
    { path: '/statistics', icon: BarChart3, label: 'Statistiques' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="ml-2 lg:ml-0 text-2xl font-bold text-blue-600">SmartManager</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition
                  ${isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
