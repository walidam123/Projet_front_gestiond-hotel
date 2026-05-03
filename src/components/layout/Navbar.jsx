import { useState } from 'react';
import { LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header style={{
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderBottom: darkMode ? '1px solid #374151' : '1px solid #f3f4f6',
      transition: 'background-color 0.3s ease'
    }} className="h-16 flex items-center justify-between px-8 sticky top-0 z-20">

      {/* Actions droite */}
      <div className="flex items-center gap-3 ml-auto">

        {/* Bouton Paramètres */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Menu Paramètres */}
          {showSettings && (
            <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
                Paramètres
              </p>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  {darkMode
                    ? <Moon className="w-4 h-4 text-yellow-500" />
                    : <Sun className="w-4 h-4 text-yellow-500" />
                  }
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {darkMode ? 'Mode sombre' : 'Mode clair'}
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-yellow-500' : 'bg-gray-200'
                    }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${darkMode ? 'left-6' : 'left-1'
                    }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Déconnexion */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
}