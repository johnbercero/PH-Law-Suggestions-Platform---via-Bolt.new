import { ComponentChildren } from "preact";
import { User } from "../../types/index.ts";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

interface LayoutProps {
  user: User | null;
  children: ComponentChildren;
  title?: string;
  fullWidth?: boolean;
}

export default function Layout({ user, children, title, fullWidth = false }: LayoutProps) {
  return (
    <div class="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main class="flex-grow">
        {title && (
          <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>
        )}
        
        <div class={`${fullWidth ? '' : 'max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'}`}>
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}