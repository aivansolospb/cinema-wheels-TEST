
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tg-bg/80 dark:bg-black/70">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-tg-hint border-t-tg-button"></div>
    </div>
  );
};

export default Loader;