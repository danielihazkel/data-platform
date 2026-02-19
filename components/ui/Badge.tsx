import React from 'react';

export const StatusBadge: React.FC<{ isActive: number }> = ({ isActive }) => {
  const active = isActive === 1;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
          : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {active ? 'פעיל' : 'לא פעיל'}
    </span>
  );
};
