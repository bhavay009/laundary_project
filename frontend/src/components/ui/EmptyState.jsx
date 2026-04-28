import { PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  actionTo,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-brand-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && actionTo && (
        <button onClick={() => navigate(actionTo)} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
