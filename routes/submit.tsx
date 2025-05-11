import { Handlers, PageProps } from "$fresh/server.ts";
import { User, Suggestion } from "../types/index.ts";
import Layout from "./_components/Layout.tsx";
import Input from "./_components/Input.tsx";
import Button from "./_components/Button.tsx";
import { createSuggestion } from "../db/db.ts";
import { FileText, Upload, X, PlusCircle, Send } from "icons/";
import { suggestionSchema, fileUploadSchema } from "../utils/validation.ts";

interface SubmitPageData {
  user: User | null;
  formErrors?: Record<string, string>;
  formData?: {
    title?: string;
    description?: string;
    category?: string;
  };
  errorMessage?: string;
  successMessage?: string;
  categories: string[];
}

const CATEGORIES = [
  "Education",
  "Healthcare",
  "Environment",
  "Transportation",
  "Economy",
  "Technology",
  "Agriculture",
  "Public Safety",
  "Social Welfare",
  "Governance",
  "Other"
];

export const handler: Handlers<SubmitPageData> = {
  GET(_req, ctx) {
    return ctx.render({
      user: ctx.state.user,
      categories: CATEGORIES,
    });
  },
  
  async POST(req, ctx) {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    
    const result = suggestionSchema.safeParse({
      title,
      description,
      category,
    });
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      
      return ctx.render({
        user: ctx.state.user,
        formErrors: formattedErrors,
        formData: { title, description, category },
        categories: CATEGORIES,
      });
    }
    
    try {
      // In a real app, we would process file uploads here
      // For simplicity, we're skipping actual file uploads
      
      const suggestion = await createSuggestion({
        title,
        description,
        category,
        authorId: ctx.state.user!.id,
        authorName: ctx.state.user!.name,
        authorProfileImage: ctx.state.user!.profileImage,
        attachments: [], // Normally we would add processed attachments here
      });
      
      // Redirect to the suggestion page
      return new Response(null, {
        status: 303,
        headers: { Location: `/suggestion/${suggestion.id}?success=true` },
      });
      
    } catch (error) {
      return ctx.render({
        user: ctx.state.user,
        formData: { title, description, category },
        errorMessage: "An error occurred while creating your suggestion. Please try again.",
        categories: CATEGORIES,
      });
    }
  },
};

export default function SubmitPage({ data }: PageProps<SubmitPageData>) {
  const { user, formErrors = {}, formData = {}, errorMessage, categories } = data;
  
  return (
    <Layout user={user} title="Submit a Suggestion">
      <div class="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Submit Your Suggestion</h2>
            <p class="text-gray-600 mt-1">
              Share your ideas for new laws, regulations, or improvements to existing ones.
            </p>
          </div>
          
          {errorMessage && (
            <div class="mb-6 p-4 bg-error-50 border border-error-200 text-error-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          <form method="POST" encType="multipart/form-data" class="space-y-6">
            <Input
              id="title"
              name="title"
              type="text"
              label="Title"
              placeholder="A brief title for your suggestion"
              required
              fullWidth
              value={formData.title || ""}
              error={formErrors.title}
            />
            
            <div class="mb-4">
              <label htmlFor="category" class="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                class={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  formErrors.category ? "border-error-300" : "border-gray-300"
                }`}
                required
                value={formData.category || ""}
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p class="mt-1 text-sm text-error-600">{formErrors.category}</p>
              )}
            </div>
            
            <div class="mb-4">
              <label htmlFor="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                class={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  formErrors.description ? "border-error-300" : "border-gray-300"
                }`}
                placeholder="Describe your suggestion in detail. What problem does it solve? How should it be implemented?"
                required
                value={formData.description || ""}
              />
              {formErrors.description && (
                <p class="mt-1 text-sm text-error-600">{formErrors.description}</p>
              )}
              <p class="mt-1 text-sm text-gray-500">
                Provide as much detail as possible to help lawmakers understand your suggestion.
              </p>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Attachments (Optional)
              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <Upload class="mx-auto h-12 w-12 text-gray-400" />
                  <div class="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="attachments"
                        type="file"
                        class="sr-only"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                      />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">
                    Images, videos, and documents up to 10MB each
                  </p>
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Tip: Adding supporting evidence like images, documents, or videos can strengthen your suggestion.
              </p>
            </div>
            
            {/* File preview area would go here in a real app */}
            
            <div class="border-t border-gray-200 pt-6">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">
                  Your suggestion will be reviewed before being made public.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={<Send class="w-5 h-5" />}
                  iconPosition="right"
                >
                  Submit Suggestion
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}