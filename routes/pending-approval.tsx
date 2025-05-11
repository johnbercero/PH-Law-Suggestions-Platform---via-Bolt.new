import { PageProps } from "$fresh/server.ts";
import Layout from "./_components/Layout.tsx";
import Button from "./_components/Button.tsx";
import { User } from "../types/index.ts";
import { Clock, Mail } from "icons/";

interface PendingApprovalPageData {
  user: User | null;
}

export default function PendingApprovalPage({ data }: PageProps<PendingApprovalPageData>) {
  const { user } = data;
  
  return (
    <Layout user={user}>
      <div class="max-w-lg mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-8">
        <div class="p-6">
          <div class="flex justify-center mb-4">
            <div class="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <Clock class="h-10 w-10 text-primary-600" />
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 text-center mb-4">
            Waiting for Approval
          </h2>
          
          <p class="text-gray-600 text-center mb-6">
            Your account is pending approval by an administrator. Once approved, you'll be able to submit and vote on suggestions.
          </p>
          
          <div class="bg-primary-50 border border-primary-200 rounded-md p-4 mb-6">
            <p class="text-primary-800 text-sm">
              Our admin team reviews all registration requests to ensure the platform remains secure. This usually takes less than 24 hours.
            </p>
          </div>
          
          <div class="border-t border-gray-200 pt-6">
            <p class="text-sm text-gray-500 mb-4 text-center">
              Have questions? Contact us at:
            </p>
            <a 
              href="mailto:support@phcitizenvoice.org" 
              class="flex items-center justify-center text-primary-600 hover:text-primary-800"
            >
              <Mail class="w-5 h-5 mr-2" />
              support@phcitizenvoice.org
            </a>
          </div>
        </div>
        
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <Button href="/signout" variant="outline" fullWidth>
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}