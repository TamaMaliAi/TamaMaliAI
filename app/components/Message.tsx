import React from 'react';

interface MessageProps {
  message: string;
  isVisible: boolean;
}

export default function Message({ message, isVisible }: MessageProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100]">
      {message}
    </div>
  );
}