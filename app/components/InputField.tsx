// components/InputField.tsx
import React, { useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  icon?: LucideIcon;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function InputField({ 
  icon: Icon, 
  type, 
  name, 
  placeholder, 
  value, 
  onChange, 
  className = "bg-gray-100 mb-3 h-[55px] rounded-md flex items-center px-3" 
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordField = type === 'password' || name === 'confirmPassword';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      {Icon && <Icon className="text-gray-400 mr-2" size={20} />}
      <input
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
      />
      {isPasswordField && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}