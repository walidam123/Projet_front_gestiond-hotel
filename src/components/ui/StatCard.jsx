import { clsx } from 'clsx';

export function StatCard({ label, value, icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-[#C9A84C]/10 text-[#C9A84C]',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      {icon && (
        <div className={clsx("p-3 rounded-lg", colors[color] || colors.primary)}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}
