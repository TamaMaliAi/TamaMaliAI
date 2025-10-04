import React from 'react';
import { LucideIcon } from 'lucide-react';
import Image from "next/image";

interface InfoPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  imageAlt: string;
  isLeft: boolean;
  isActive: boolean;
  onButtonClick: () => void;
}

export default function InfoPanel({
  icon: Icon,
  title,
  description,
  buttonText,
  imageUrl,
  imageAlt,
  isLeft,
  isActive,
  onButtonClick,
}: InfoPanelProps) {
  const panelClasses = isLeft
    ? "flex flex-col items-end justify-around text-center z-[7] py-12 pr-[17%] pl-[12%] "
    : "flex flex-col items-start justify-around text-center z-[7] py-12 pl-[12%] pr-[17%] ";

  const pointerEvents = isLeft
    ? (!isActive ? "pointer-events-auto" : "pointer-events-none")
    : (isActive ? "pointer-events-auto" : "pointer-events-none");

  const contentTransform = isLeft
    ? (isActive ? "-translate-x-[800px]" : "translate-x-0")
    : (isActive ? "translate-x-0" : "translate-x-[800px]");

  const imageTransform = isLeft
    ? (isActive ? "-translate-x-[800px]" : "translate-x-0")
    : (isActive ? "translate-x-0" : "translate-x-[800px]");

  return (
    <div className={panelClasses + pointerEvents}>
      <div
        className={
          "text-white transition-transform duration-900 ease-in-out delay-600 " +
          contentTransform
        }
      >
        <Icon className="mx-auto mb-4" size={48} />
        <h3 className="font-semibold text-2xl">{title}</h3>
        <p className="text-sm py-3">{description}</p>
        <button
          onClick={onButtonClick}
          className="bg-transparent border-2 border-white w-[130px] h-[41px] font-semibold text-sm text-white hover:bg-white hover:text-orange-500 transition-all duration-300 cursor-pointer rounded relative z-[8]"
        >
          {buttonText}
        </button>
      </div>

      {/* ✅ Optimized Image */}
      <div
        className={
          "w-full transition-transform duration-1100 ease-in-out delay-400 " +
          imageTransform
        }
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={500}   // pick a reasonable width
          height={500}  // pick a reasonable height
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </div>
  );
}
