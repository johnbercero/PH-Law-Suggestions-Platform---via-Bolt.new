import { PageProps } from "$fresh/server.ts";
import { User, Suggestion } from "../types/index.ts";
import Layout from "./_components/Layout.tsx";
import Button from "./_components/Button.tsx";
import { Send, LogIn } from "icons/";

interface HomePageProps extends PageProps {
  user: User | null;
  suggestions: Suggestion[];
}

export default function HomePage({ data }: PageProps<HomePageProps>) {
  const { user } = data;
  
  return (
    <Layout user={user} fullWidth={true}>
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Shape the Future of the Philippines
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Submit your suggestions for new laws and regulations. Together, we can build a better nation.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Button
                  href="/submit"
                  variant="primary"
                  size="lg"
                  icon={<Send className="w-5 h-5" />}
                >
                  Submit Suggestion
                </Button>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Button
                  href="/signin"
                  variant="outline"
                  size="lg"
                  icon={<LogIn className="w-5 h-5" />}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Make Your Voice Heard
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              A simple process to submit your suggestions and contribute to the nation's progress.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  title: 'Create an Account',
                  description: 'Sign up using your email or Google account to start participating.',
                },
                {
                  title: 'Submit Your Suggestion',
                  description: 'Share your ideas for new laws or improvements to existing ones.',
                },
                {
                  title: 'Add Supporting Materials',
                  description: 'Upload documents, images, or videos to strengthen your suggestion.',
                },
                {
                  title: 'Community Voting',
                  description: 'The most popular suggestions will be sent directly to Congress.',
                },
              ].map((feature) => (
                <div key={feature.title} className="relative">
                  <dt>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to contribute?</span>
            <span className="block">Start making a difference today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join thousands of citizens working together to improve our nation's laws and regulations.
          </p>
          <Button
            href="/signup"
            variant="outline"
            size="lg"
            class="mt-8 !text-white !border-white hover:!bg-primary-600"
          >
            Get Started
          </Button>
        </div>
      </div>
    </Layout>
  );
}