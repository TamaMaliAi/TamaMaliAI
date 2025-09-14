"use client";
import { useState } from "react";
import { User, Lock, Mail, GraduationCap, BookOpen } from "lucide-react";

export default function AuthPage() {
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [message, setMessage] = useState("");

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const userType = isTeacherMode ? "Teacher" : "Student";
    const action = isSignUpMode ? "Sign up" : "Login";
    
    if (isSignUpMode) {
      setMessage(`${userType} ${action} attempted with: ${formData.firstName} ${formData.lastName}, ${formData.email}`);
    } else {
      setMessage(`${userType} ${action} attempted with: ${formData.username}`);
    }
    
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleSignUpMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden">
      {/* Message display */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] transition-all duration-300">
          {message}
        </div>
      )}

      {/* Orange circle background - Fixed for zoom issues */}
      <div
        className={
          "absolute w-[200vmax] h-[200vmax] top-[5%] right-[48%] -translate-y-1/2 rounded-full bg-gradient-to-bl from-orange-500 via-orange-400 to-yellow-400 transition-all duration-[1800ms] ease-in-out z-[6] " +
          (isTeacherMode ? "translate-x-full right-[52%]" : "translate-x-0")
        }
      />

      {/* Forms container */}
      <div className="absolute w-full h-full top-0 left-0">
        <div
          className={
            "absolute top-1/2 -translate-y-1/2 w-1/2 transition-all duration-1000 ease-in-out delay-700 grid grid-cols-1 z-[50] " +
            (isTeacherMode
              ? "left-[25%] -translate-x-1/2"
              : "left-[75%] -translate-x-1/2")
          }
        >
          {/* Student form */}
          <div
            className={
              "flex items-center justify-center flex-col px-10 transition-all duration-200 ease-in-out delay-700 overflow-hidden col-start-1 row-start-1 " +
              (isTeacherMode ? "opacity-0 z-[1]" : "opacity-100 z-[51]")
            }
          >
            <div className="flex items-center mb-4">
              <GraduationCap className="text-gray-700 mr-3" size={32} />
              <h2 className="text-4xl text-gray-700 font-semibold">
                {isSignUpMode ? "Student Sign up" : "Student Login"}
              </h2>
            </div>

            {/* Form fields with smooth transitions */}
            <div className="w-full max-w-[380px]">
              {/* Sign up fields */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSignUpMode ? 'max-h-32 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                <div className="flex space-x-3">
                  <div className="flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                    <User className="text-gray-400 mr-2" size={20} />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                  </div>
                  <div className="flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Email field (only for sign up) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSignUpMode ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                  <Mail className="text-gray-400 mr-2" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Username field (only for login) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${!isSignUpMode ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                  <User className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Student ID or Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                <Lock className="text-gray-400 mr-2" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                />
              </div>

              {/* Confirm Password field (only for sign up) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSignUpMode ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                  <Lock className="text-gray-400 mr-2" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              className="w-[150px] bg-orange-500 h-[49px] rounded text-white uppercase font-semibold my-4 cursor-pointer transition-all duration-500 hover:bg-orange-600 active:transform active:scale-95 relative z-[52]"
            >
              {isSignUpMode ? "Sign up" : "Login"}
            </button>

            {/* Toggle between login/signup */}
            <p className="text-gray-600 text-sm mb-4">
              {isSignUpMode ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={toggleSignUpMode}
                className="text-orange-500 hover:text-orange-600 font-semibold ml-2 transition-colors duration-200"
              >
                {isSignUpMode ? "Login here" : "Sign up here"}
              </button>
            </p>
          </div>

          {/* Teacher form */}
          <div
            className={
              "flex items-center justify-center flex-col px-10 transition-all duration-200 ease-in-out delay-700 overflow-hidden col-start-1 row-start-1 " +
              (isTeacherMode ? "opacity-100 z-[51]" : "opacity-0 z-[1]")
            }
          >
            <div className="flex items-center mb-4">
              <BookOpen className="text-gray-700 mr-3" size={32} />
              <h2 className="text-4xl text-gray-700 font-semibold">
                {isSignUpMode ? "Teacher Sign up" : "Teacher Login"}
              </h2>
            </div>

            {/* Form fields with smooth transitions */}
            <div className="w-full max-w-[380px]">
              {/* Sign up fields */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSignUpMode ? 'max-h-32 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                <div className="flex space-x-3">
                  <div className="flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                    <User className="text-gray-400 mr-2" size={20} />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                  </div>
                  <div className="flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Email field (only for sign up) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSignUpMode ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                  <Mail className="text-gray-400 mr-2" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Username field (only for login) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${!isSignUpMode ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                  <User className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Teacher ID or Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                <Lock className="text-gray-400 mr-2" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                />
              </div>

              {/* Confirm Password field (only for sign up) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSignUpMode ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-100 my-3 h-[55px] rounded-md flex items-center px-3 focus-within:bg-gray-200 transition-colors duration-200">
                  <Lock className="text-gray-400 mr-2" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              className="w-[150px] bg-orange-500 h-[49px] rounded text-white uppercase font-semibold my-4 cursor-pointer transition-all duration-500 hover:bg-orange-600 active:transform active:scale-95 relative z-[52]"
            >
              {isSignUpMode ? "Sign up" : "Login"}
            </button>

            {/* Toggle between login/signup */}
            <p className="text-gray-600 text-sm mb-4">
              {isSignUpMode ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={toggleSignUpMode}
                className="text-orange-500 hover:text-orange-600 font-semibold ml-2 transition-colors duration-200"
              >
                {isSignUpMode ? "Login here" : "Sign up here"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Panels - keeping original layout but updating content */}
      <div className="absolute h-full w-full top-0 left-0 grid grid-cols-2 z-[7]">
        {/* Left panel */}
        <div
          className={
            "flex flex-col items-end justify-around text-center z-[7] py-12 pr-[17%] pl-[12%] " +
            (isTeacherMode ? "pointer-events-none" : "pointer-events-auto")
          }
        >
          <div
            className={
              "text-white transition-transform duration-900 ease-in-out delay-600 " +
              (isTeacherMode ? "-translate-x-[800px]" : "translate-x-0")
            }
          >
            <GraduationCap className="mx-auto mb-4" size={48} />
            <h3 className="font-semibold text-2xl">Student Portal</h3>
            <p className="text-sm py-3">
              Access your courses, assignments, and track your academic progress.
            </p>
            <button
              onClick={() => setIsTeacherMode(true)}
              className="bg-transparent border-2 border-white w-[130px] h-[41px] font-semibold text-sm text-white hover:bg-white hover:text-orange-500 transition-all duration-300 cursor-pointer rounded relative z-[8]"
            >
              Teacher Login
            </button>
          </div>
          <img
            src="https://i.ibb.co/6HXL6q1/Privacy-policy-rafiki.png"
            alt="Student illustration"
            className={
              "w-full transition-transform duration-1100 ease-in-out delay-400 " +
              (isTeacherMode ? "-translate-x-[800px]" : "translate-x-0")
            }
          />
        </div>

        {/* Right panel */}
        <div
          className={
            "flex flex-col items-start justify-around text-center z-[7] py-12 pl-[12%] pr-[17%] " +
            (isTeacherMode ? "pointer-events-auto" : "pointer-events-none")
          }
        >
          <div
            className={
              "text-white transition-transform duration-900 ease-in-out delay-600 " +
              (isTeacherMode ? "translate-x-0" : "translate-x-[800px]")
            }
          >
            <BookOpen className="mx-auto mb-4" size={48} />
            <h3 className="font-semibold text-2xl">Teacher Portal</h3>
            <p className="text-sm py-3">
              Manage your classes, create assignments, and monitor student performance.
            </p>
            <button
              onClick={() => setIsTeacherMode(false)}
              className="bg-transparent border-2 border-white w-[130px] h-[41px] font-semibold text-sm text-white hover:bg-white hover:text-orange-500 transition-all duration-300 cursor-pointer rounded relative z-[8]"
            >
              Student Login
            </button>
          </div>
          <img
            src="https://i.ibb.co/nP8H853/Mobile-login-rafiki.png"
            alt="Teacher illustration"
            className={
              "w-full transition-transform duration-1100 ease-in-out delay-400 " +
              (isTeacherMode ? "translate-x-0" : "translate-x-[800px]")
            }
          />
        </div>
      </div>
    </div>
  );
}