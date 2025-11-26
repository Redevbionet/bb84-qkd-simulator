import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-gray-400">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mb-4"></div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};