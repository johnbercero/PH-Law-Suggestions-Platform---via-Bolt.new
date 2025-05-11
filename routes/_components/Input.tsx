import { JSX } from "preact";
import { useState } from "preact/hooks";
import { Eye, EyeOff } from "icons/";

interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
  type?: string;
  helpText?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  id,
  type = "text",
  helpText,
  fullWidth = false,
  class: className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;
  
  const baseStyles = "block rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm";
  const errorStyles = error ? "border-error-300" : "border-gray-300";
  const widthStyles = fullWidth ? "w-full" : "";
  
  const allStyles = [
    baseStyles,
    errorStyles,
    widthStyles,
    className,
  ].filter(Boolean).join(" ");
  
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div class="mb-4">
      {label && (
        <label htmlFor={id} class="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div class="relative">
        <input
          id={id}
          type={inputType}
          class={allStyles}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...props}
        />
        
        {type === "password" && (
          <button
            type="button"
            onClick={togglePassword}
            class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
          >
            {showPassword ? <EyeOff class="w-5 h-5" /> : <Eye class="w-5 h-5" />}
          </button>
        )}
      </div>
      
      {error && (
        <p id={`${id}-error`} class="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${id}-help`} class="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}