import { ComponentChildren, JSX } from "preact";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  children: ComponentChildren;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: ComponentChildren;
  iconPosition?: "left" | "right";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  icon,
  iconPosition = "left",
  type = "button",
  class: className,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary: "bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-primary-500",
    danger: "bg-error-600 hover:bg-error-700 text-white focus:ring-error-500",
  };
  
  const sizeStyles: Record<ButtonSize, string> = {
    xs: "text-xs px-2.5 py-1.5",
    sm: "text-sm px-3 py-2",
    md: "text-sm px-4 py-2",
    lg: "text-base px-4 py-2",
    xl: "text-base px-6 py-3",
  };
  
  const loadingStyles = isLoading ? "opacity-70 cursor-not-allowed" : "";
  const widthStyles = fullWidth ? "w-full" : "";
  
  const allStyles = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    loadingStyles,
    widthStyles,
    className,
  ].filter(Boolean).join(" ");
  
  return (
    <button
      type={type}
      class={allStyles}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg 
          class="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            class="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          ></circle>
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && icon && iconPosition === "left" && (
        <span class="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!isLoading && icon && iconPosition === "right" && (
        <span class="ml-2">{icon}</span>
      )}
    </button>
  );
}