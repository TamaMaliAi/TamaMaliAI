import React from 'react';
import { User, Lock, Mail, LucideIcon } from 'lucide-react';
import InputField from './InputField';

interface AuthFormProps {
  title: string;
  icon: LucideIcon;
  isSignUpMode: boolean;
  isLoading: boolean;
  formData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onToggleSignUpMode: () => void;
  isVisible: boolean;
}

export default function AuthForm({
  title,
  icon: Icon,
  isSignUpMode,
  isLoading,
  formData,
  onInputChange,
  onSubmit,
  onToggleSignUpMode,
  isVisible,
}: AuthFormProps) {
  return (
    <div
      className={
        "flex items-center justify-center flex-col px-10 transition-all duration-200 ease-in-out delay-700 overflow-hidden col-start-1 row-start-1 " +
        (isVisible ? "opacity-100 z-[51]" : "opacity-0 z-[1]")
      }
    >
      <div className="flex items-center mb-4">
        <Icon className="text-gray-700 mr-3" size={32} />
        <h2 className="text-4xl text-gray-700 font-semibold">
          {isSignUpMode ? `${title} Sign up` : `${title} Login`}
        </h2>
      </div>

      <div className="w-full max-w-[380px]">
        {/* Sign up fields */}
        {isSignUpMode && (
          <div className="mb-3">
            <div className="flex space-x-3 mb-3">
              <InputField
                icon={User}
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={onInputChange}
                className="flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3"
              />
              <InputField
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={onInputChange}
                className="flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3"
              />
            </div>
            <InputField
              icon={Mail}
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={onInputChange}
            />
          </div>
        )}

        {/* Login field */}
        {!isSignUpMode && (
          <InputField
            icon={User}
            type="text"
            name="username"
            placeholder="Email Address"
            value={formData.username}
            onChange={onInputChange}
          />
        )}

        {/* Password */}
        <InputField
          icon={Lock}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={onInputChange}
        />

        {/* Confirm Password */}
        {isSignUpMode && (
          <InputField
            icon={Lock}
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={onInputChange}
          />
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-[150px] bg-orange-500 h-[49px] rounded text-white uppercase font-semibold my-4 cursor-pointer hover:bg-orange-600 disabled:opacity-50"
      >
        {isLoading ? "Loading..." : (isSignUpMode ? "Sign up" : "Login")}
      </button>

      <p className="text-gray-600 text-sm mb-4">
        {isSignUpMode ? "Already have an account?" : "Don't have an account?"}
        <button
          onClick={onToggleSignUpMode}
          className="text-orange-500 hover:text-orange-600 font-semibold ml-2 cursor-pointer"
        >
          {isSignUpMode ? "Login here" : "Sign up here"}
        </button>
      </p>
    </div>
  );
}