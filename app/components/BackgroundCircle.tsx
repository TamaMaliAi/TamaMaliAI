import React from 'react';

interface BackgroundCircleProps {
  isTeacherMode: boolean;
}

export default function BackgroundCircle({ isTeacherMode }: BackgroundCircleProps) {
  return (
    <div
      className={
        "absolute w-[200vmax] h-[200vmax] top-[5%] right-[48%] -translate-y-1/2 rounded-full bg-gradient-to-bl from-orange-500 via-orange-400 to-yellow-400 transition-all duration-[1800ms] ease-in-out z-[6] " +
        (isTeacherMode ? "translate-x-full right-[52%]" : "translate-x-0")
      }
    />
  );
}