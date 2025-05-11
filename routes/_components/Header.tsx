import { ComponentChildren } from "preact";
import { User } from "../../types/index.ts";
import { UserIcon, LogIn, LogOut, Home, PlusCircle, BarChart2, UserCheck } from "icons/";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div class="flex items-center">
          <a href="/" class="flex items-center">
            <img 
              src="/images/ph-logo.svg" 
              alt="Philippines Citizen Suggestion Platform" 
              class="h-8 w-auto mr-3"
            />
            <span class="text-primary-700 font-semibold text-lg hidden md:block">
              Philippines Citizen Voice
            </span>
          </a>
        </div>
        
        <nav class="flex items-center space-x-1 md:space-x-4">
          <NavLink href="/">
            <Home class="w-5 h-5 mr-1" />
            <span class="hidden md:inline">Home</span>
          </NavLink>
          
          {user ? (
            <>
              <NavLink href="/submit">
                <PlusCircle class="w-5 h-5 mr-1" />
                <span class="hidden md:inline">Submit</span>
              </NavLink>
              
              {user.isAdmin && (
                <NavLink href="/admin/dashboard">
                  <BarChart2 class="w-5 h-5 mr-1" />
                  <span class="hidden md:inline">Admin</span>
                </NavLink>
              )}
              
              <NavLink href="/profile">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    class="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserIcon class="w-5 h-5 mr-1" />
                )}
                <span class="hidden md:inline">{user.name}</span>
              </NavLink>
              
              <NavLink href="/signout">
                <LogOut class="w-5 h-5 mr-1" />
                <span class="hidden md:inline">Sign Out</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink href="/signin">
                <LogIn class="w-5 h-5 mr-1" />
                <span class="hidden md:inline">Sign In</span>
              </NavLink>
              
              <NavLink 
                href="/signup" 
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                <UserCheck class="w-5 h-5 mr-1" />
                <span class="hidden md:inline">Sign Up</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  children: ComponentChildren;
  className?: string;
}

function NavLink({ href, children, className }: NavLinkProps) {
  const baseClasses = "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const defaultClasses = "text-gray-700 hover:text-primary-600 hover:bg-gray-50";
  
  return (
    <a href={href} class={className || `${baseClasses} ${defaultClasses}`}>
      {children}
    </a>
  );
}