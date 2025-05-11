import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "./_components/Layout.tsx";
import Input from "./_components/Input.tsx";
import Button from "./_components/Button.tsx";
import { User } from "../types/index.ts";
import { signIn, setUserSession, getGoogleAuthUrl } from "../utils/auth.ts";
import { LogIn, Mail, Key, ArrowRight } from "icons/";
import { signInSchema } from "../utils/validation.ts";

interface SignInPageData {
  user: User | null;
  formErrors?: Record<string, string>;
  formData?: {
    email?: string;
  };
  errorMessage?: string;
  redirectTo?: string;
  message?: string;
}

export const handler: Handlers<SignInPageData> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/";
    const message = url.searchParams.get("message") || "";
    
    return ctx.render({
      user: ctx.state.user,
      redirectTo,
      message,
    });
  },
  
  async POST(req, ctx) {
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/";
    
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const result = signInSchema.safeParse({
      email,
      password,
    });
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      
      return ctx.render({
        user: ctx.state.user,
        formErrors: formattedErrors,
        formData: { email },
        redirectTo,
      });
    }
    
    try {
      const user = await signIn(email, password);
      
      if (!user) {
        return ctx.render({
          user: ctx.state.user,
          formData: { email },
          errorMessage: "Invalid email or password. Or your account may not be approved yet.",
          redirectTo,
        });
      }
      
      // Set session for the user
      const response = new Response(null, {
        status: 303,
        headers: { Location: redirectTo },
      });
      
      await setUserSession(user.id, response);
      return response;
      
    } catch (error) {
      return ctx.render({
        user: ctx.state.user,
        formData: { email },
        errorMessage: "An error occurred during sign in. Please try again.",
        redirectTo,
      });
    }
  },
};

export default function SignInPage({ data }: PageProps<SignInPageData>) {
  const { user, formErrors = {}, formData = {}, errorMessage, redirectTo = "/", message } = data;
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
    <Layout user={user} title="Sign In">
      <div class="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign In
          </h2>
          
          {message && (
            <div class="mb-4 p-3 bg-info-50 border border-info-200 text-info-700 rounded-md">
              {message}
            </div>
          )}
          
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
                placeholder="Your password"
                required
                fullWidth
                error={formErrors.password}
                icon={<Key class="w-5 h-5" />}
              />
              
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" class="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <div class="text-sm">
                  <a href="/forgot-password" class="text-primary-600 hover:text-primary-800 font-medium">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <input type="hidden" name="redirectTo" value={redirectTo} />
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight class="w-5 h-5" />}
                iconPosition="right"
              >
                Sign In
              </Button>
            </form>
          </div>
          
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" class="text-primary-600 hover:text-primary-800 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}