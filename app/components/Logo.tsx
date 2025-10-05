import Image from "next/image";

interface LogoProps {
  isTeacherMode: boolean;
}

export default function Logo({ isTeacherMode }: LogoProps) {
  return (
    <div
      className={`
        absolute top-6 transition-all duration-1000 ease-in-out z-[60]
        ${isTeacherMode ? "left-[7%]" : "left-[90%]"}
        -translate-x-1/2
      `}
    >
      <Image
        src="/tamamali.png"
        alt="App Logo"
        width={200}
        height={200}
        priority
        className="w-[200px] h-auto"
      />
    </div>
  );
}
