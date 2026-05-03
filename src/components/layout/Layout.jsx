import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useTheme } from '../../context/ThemeContext';

export function Layout() {
  const { darkMode } = useTheme();

  return (
    <div style={{
      backgroundColor: darkMode ? '#111827' : '#FAFAF8',
      color: darkMode ? '#f9fafb' : '#1a1a1a',
      minHeight: '100vh',
      display: 'flex',
      transition: 'background-color 0.3s ease'
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: darkMode ? '#111827' : '#FAFAF8',
          transition: 'background-color 0.3s ease'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}