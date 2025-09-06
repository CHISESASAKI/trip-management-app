import type { ReactNode } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  suggestions?: string[];
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  suggestions = [],
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <div className="flex items-start gap-2 mb-3">
            <Lightbulb className="text-blue-600 dark:text-blue-400 mt-0.5" size={16} />
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              始め方のヒント
            </h4>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                <ChevronRight className="mt-0.5 flex-shrink-0" size={12} />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}