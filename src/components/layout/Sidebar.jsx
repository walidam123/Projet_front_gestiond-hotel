import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  ConciergeBell, 
  Receipt, 
  Users,
  Hotel
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const getIcon = (path) => {
  switch (path) {
    case '/': return <LayoutDashboard className="w-5 h-5" />;
    case '/reservations': return <CalendarDays className="w-5 h-5" />;
    case '/rooms': return <BedDouble className="w-5 h-5" />;
    case '/services': return <ConciergeBell className="w-5 h-5" />;
    case '/invoices': return <Receipt className="w-5 h-5" />;
    case '/users': return <Users className="w-5 h-5" />;
    default: return <LayoutDashboard className="w-5 h-5" />;
  }
};

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Tableau de bord', path: '/', roles: ['all'] },
    { label: 'Réservations', path: '/reservations', roles: ['ROLE_RECEPTIONNISTE', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
    { label: 'Chambres', path: '/rooms', roles: ['ROLE_GOUVERNANTE', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
    { label: 'Services', path: '/services', roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
    { label: 'Facturation', path: '/invoices', roles: ['ROLE_RECEPTIONNISTE', 'ROLE_ADMIN'] },
    { label: 'Utilisateurs', path: '/users', roles: ['ROLE_ADMIN'] },
  ].filter(item => item.roles.includes('all') || item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10">
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">Royal<span className="text-primary">Palace</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1">Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={twMerge(
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                )
              )}
            >
              <span className={clsx("transition-transform duration-300", isActive && "scale-110")}>
                {getIcon(item.path)}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-bold shadow-sm border border-gray-100">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 truncate">{user?.name}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {user?.role?.replace('ROLE_', '')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
