import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "./_components/Layout.tsx";
import Input from "./_components/Input.tsx";
import Button from "./_components/Button.tsx";
import { User } from "../types/index.ts";
import { signUp, setUserSession } from "../utils/auth.ts";
import { getGoogleAuthUrl } from "../utils/auth.ts";
import { LogIn, Mail, User as UserIcon, Key, ArrowRight } from "icons/";
import { z } from "zod";
import { signUpSchema } from "../utils/validation.ts";

interface SignUpPageData {
  user: User | null;
  formErrors?: Record<string, string>;
  formData?: {
    name?: string;
    email?: string;
  };
  errorMessage?: string;
  redirectTo?: string;
}

export const handler: Handlers<SignUpPageData> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/";
    
    return ctx.render({
      user: ctx.state.user,
      redirectTo,
    });
  },
  
  async POST(req, ctx) {
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/";
    
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    const result = signUpSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      
      return ctx.render({
        user: ctx.state.user,
        formErrors: formattedErrors,
        formData: { name, email },
        redirectTo,
      });
    }
    
    try {
      const user = await signUp(email, password, name);
      
      if (!user) {
        return ctx.render({
          user: ctx.state.user,
          formData: { name, email },
          errorMessage: "An account with this email already exists.",
          redirectTo,
        });
      }
      
      // Set session for the user
      const response = new Response(null, {
        status: 303,
        headers: { Location: "/pending-approval" },
      });
      
      await setUserSession(user.id, response);
      return response;
      
    } catch (error) {
      return ctx.render({
        user: ctx.state.user,
        formData: { name, email },
        errorMessage: "An error occurred during sign up. Please try again.",
        redirectTo,
      });
    }
  },
};

export default function SignUpPage({ data }: PageProps<SignUpPageData>) {
  const { user, formErrors = {}, formData = {}, errorMessage, redirectTo = "/" } = data;
  const googleAuthUrl = getGoogleAuthUrl();
  
  // If user is already logged in, redirect to home
  if (user) {
    return (
      <Layout user={user}>
        <div class="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">You're Already Signed In</h2>
          <p class="text-gray-600 mb-4">You are already signed in as {user.name}.</p>
          <Button href="/" variant="primary" fullWidth>Go to Homepage</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout user={user} title="Create an Account">
      <div class="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
            Create an Account
          </h2>
          
          {errorMessage && (
            <div class="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          <div class="space-y-4">
            <Button
              href={googleAuthUrl}
              variant="outline"
              fullWidth
              icon={<img src="/images/google-logo.svg" alt="Google" class="w-5 h-5" />}
            >
              Continue with Google
            </Button>
            
            <div class="relative flex items-center justify-center">
              <div class="border-t border-gray-300 flex-grow"></div>
              <div class="mx-4 text-sm text-gray-500">or</div>
              <div class="border-t border-gray-300 flex-grow"></div>
            </div>
            
            <form method="POST" class="space-y-4">
              <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                placeholder="Your full name"
                required
                fullWidth
                value={formData.name || ""}
                error={formErrors.name}
                icon={<UserIcon class="w-5 h-5" />}
              />
              
              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="your.email@example.com"
                required
                fullWidth
                value={formData.email || ""}
                error={formErrors.email}
                icon={<Mail class="w-5 h-5" />}
              />
              
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Create a strong password"
                required
                fullWidth
                error={formErrors.password}
                helpText="At least 8 characters with uppercase, lowercase, and numbers"
                icon={<Key class="w-5 h-5" />}
              />
              
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                fullWidth
                error={formErrors.confirmPassword}
                icon={<Key class="w-5 h-5" />}
              />
              
              <input type="hidden" name="redirectTo" value={redirectTo} />
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight class="w-5 h-5" />}
                iconPosition="right"
              >
                Create Account
              </Button>
            </form>
          </div>
          
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/signin" class="text-primary-600 hover:text-primary-800 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{" "}
            <a href="/terms" class="text-primary-600 hover:underline">Terms of Service</a> and{" "}
            <a href="/privacy" class="text-primary-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </Layout>
  );
}