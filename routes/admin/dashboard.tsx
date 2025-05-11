import { Handlers, PageProps } from "$fresh/server.ts";
import { User, Suggestion } from "../../types/index.ts";
import Layout from "../_components/Layout.tsx";
import Button from "../_components/Button.tsx";
import { getAllUsers, getSuggestions, updateUser, updateSuggestion } from "../../db/db.ts";
import { sendEmail, generateUserApprovalEmail, generateSuggestionApprovalEmail } from "../../utils/email.ts";
import { Users, FileText, CheckCircle, XCircle, Send, UserCheck, UserX, ShieldCheck } from "icons/";

interface AdminDashboardData {
  user: User | null;
  pendingUsers: User[];
  pendingApprovalCount: number;
  pendingSuggestions: Suggestion[];
  pendingSuggestionsCount: number;
  popularSuggestions: Suggestion[];
  totalUsers: number;
  totalSuggestions: number;
  message?: string;
  error?: string;
}

export const handler: Handlers<AdminDashboardData> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const message = url.searchParams.get("message") || undefined;
    const error = url.searchParams.get("error") || undefined;
    
    // Get users pending approval
    const allUsers = await getAllUsers();
    const pendingUsers = allUsers.filter(user => !user.isApproved && !user.isBlocked);
    
    // Get pending suggestions
    const pendingSuggestions = await getSuggestions(5, 0, { status: "pending" }, "newest");
    
    // Get popular suggestions
    const popularSuggestions = await getSuggestions(5, 0, { status: "approved" }, "most-upvoted");
    
    return ctx.render({
      user: ctx.state.user,
      pendingUsers,
      pendingApprovalCount: pendingUsers.length,
      pendingSuggestions,
      pendingSuggestionsCount: pendingSuggestions.length,
      popularSuggestions,
      totalUsers: allUsers.length,
      totalSuggestions: 0, // In a real app, we would count all suggestions
      message,
      error,
    });
  },
  
  async POST(req, ctx) {
    const formData = await req.formData();
    const action = formData.get("action") as string;
    
    try {
      if (action === "approve-user") {
        const userId = formData.get("userId") as string;
        const user = await updateUser(userId, { isApproved: true });
        
        if (user) {
          // Send approval email
          await sendEmail(generateUserApprovalEmail(user.name, user.email));
          
          return new Response(null, {
            status: 303,
            headers: { Location: "/admin/dashboard?message=User approved successfully" },
          });
        }
      } else if (action === "block-user") {
        const userId = formData.get("userId") as string;
        await updateUser(userId, { isBlocked: true });
        
        return new Response(null, {
          status: 303,
          headers: { Location: "/admin/dashboard?message=User blocked successfully" },
        });
      } else if (action === "unblock-user") {
        const userId = formData.get("userId") as string;
        await updateUser(userId, { isBlocked: false });
        
        return new Response(null, {
          status: 303,
          headers: { Location: "/admin/dashboard?message=User unblocked successfully" },
        });
      } else if (action === "approve-suggestion") {
        const suggestionId = formData.get("suggestionId") as string;
        const suggestion = await updateSuggestion(suggestionId, { status: "approved" });
        
        if (suggestion) {
          // In a real app, we would get the user and send an approval email
          // For simplicity, we're skipping that step
          
          return new Response(null, {
            status: 303,
            headers: { Location: "/admin/dashboard?message=Suggestion approved successfully" },
          });
        }
      } else if (action === "reject-suggestion") {
        const suggestionId = formData.get("suggestionId") as string;
        await updateSuggestion(suggestionId, { status: "rejected" });
        
        return new Response(null, {
          status: 303,
          headers: { Location: "/admin/dashboard?message=Suggestion rejected successfully" },
        });
      } else if (action === "send-to-congress") {
        const suggestionId = formData.get("suggestionId") as string;
        const suggestion = await updateSuggestion(suggestionId, { status: "sent" });
        
        if (suggestion) {
          // In a real app, we would send an email to lawmakers
          // For simplicity, we're skipping the actual email sending
          
          return new Response(null, {
            status: 303,
            headers: { Location: "/admin/dashboard?message=Suggestion sent to Congress successfully" },
          });
        }
      }
      
      return new Response(null, {
        status: 303,
        headers: { Location: "/admin/dashboard?error=Invalid action" },
      });
    } catch (error) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/admin/dashboard?error=${encodeURIComponent(error.message)}` },
      });
    }
  },
};

export default function AdminDashboardPage({ data }: PageProps<AdminDashboardData>) {
  const {
    user,
    pendingUsers,
    pendingApprovalCount,
    pendingSuggestions,
    pendingSuggestionsCount,
    popularSuggestions,
    totalUsers,
    totalSuggestions,
    message,
    error,
  } = data;
  
  return (
    <Layout user={user} title="Admin Dashboard">
      {message && (
        <div class="mb-4 p-4 bg-success-50 border border-success-200 text-success-700 rounded-md">
          {message}
        </div>
      )}
      
      {error && (
        <div class="mb-4 p-4 bg-error-50 border border-error-200 text-error-700 rounded-md">
          {error}
        </div>
      )}
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white shadow rounded-lg p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Users class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{totalUsers}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div class="bg-white shadow rounded-lg p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-secondary-100 rounded-md p-3">
              <UserCheck class="h-6 w-6 text-secondary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{pendingApprovalCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div class="bg-white shadow rounded-lg p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-accent-100 rounded-md p-3">
              <FileText class="h-6 w-6 text-accent-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Suggestions</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{totalSuggestions}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div class="bg-white shadow rounded-lg p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-warning-100 rounded-md p-3">
              <FileText class="h-6 w-6 text-warning-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pending Suggestions</dt>
                <dd>
                  <div class="text-lg font-semibold text-gray-900">{pendingSuggestionsCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Users Awaiting Approval
            </h3>
          </div>
          
          {pendingUsers.length > 0 ? (
            <ul class="divide-y divide-gray-200">
              {pendingUsers.map((pendingUser) => (
                <li key={pendingUser.id} class="px-4 py-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      {pendingUser.profileImage ? (
                        <img 
                          src={pendingUser.profileImage} 
                          alt={pendingUser.name} 
                          class="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users class="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">{pendingUser.name}</p>
                        <p class="text-sm text-gray-500">{pendingUser.email}</p>
                      </div>
                    </div>
                    
                    <div class="flex space-x-2">
                      <form method="POST">
                        <input type="hidden" name="action" value="approve-user" />
                        <input type="hidden" name="userId" value={pendingUser.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          icon={<CheckCircle class="w-4 h-4" />}
                        >
                          Approve
                        </Button>
                      </form>
                      
                      <form method="POST">
                        <input type="hidden" name="action" value="block-user" />
                        <input type="hidden" name="userId" value={pendingUser.id} />
                        <Button
                          type="submit"
                          variant="danger"
                          size="sm"
                          icon={<XCircle class="w-4 h-4" />}
                        >
                          Block
                        </Button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div class="p-4 text-center text-gray-500">
              No users pending approval.
            </div>
          )}
          
          {pendingUsers.length > 0 && (
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
              <a
                href="/admin/users"
                class="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                View all users
              </a>
            </div>
          )}
        </div>
        
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Pending Suggestions
            </h3>
          </div>
          
          {pendingSuggestions.length > 0 ? (
            <ul class="divide-y divide-gray-200">
              {pendingSuggestions.map((suggestion) => (
                <li key={suggestion.id} class="px-4 py-4">
                  <div class="mb-2">
                    <h4 class="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                    <p class="text-sm text-gray-500 truncate">{suggestion.description.substring(0, 100)}...</p>
                  </div>
                  
                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center text-xs text-gray-500">
                      <span>{suggestion.authorName}</span>
                      <span class="mx-1">•</span>
                      <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div class="flex space-x-2">
                      <form method="POST">
                        <input type="hidden" name="action" value="approve-suggestion" />
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="xs"
                          icon={<CheckCircle class="w-4 h-4" />}
                        >
                          Approve
                        </Button>
                      </form>
                      
                      <form method="POST">
                        <input type="hidden" name="action" value="reject-suggestion" />
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <Button
                          type="submit"
                          variant="danger"
                          size="xs"
                          icon={<XCircle class="w-4 h-4" />}
                        >
                          Reject
                        </Button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div class="p-4 text-center text-gray-500">
              No suggestions pending approval.
            </div>
          )}
          
          {pendingSuggestions.length > 0 && (
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
              <a
                href="/admin/suggestions"
                class="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                View all suggestions
              </a>
            </div>
          )}
        </div>
        
        <div class="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Popular Suggestions
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Send popular suggestions to Congress for consideration.
            </p>
          </div>
          
          {popularSuggestions.length > 0 ? (
            <ul class="divide-y divide-gray-200">
              {popularSuggestions.map((suggestion) => (
                <li key={suggestion.id} class="px-4 py-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                      <p class="text-sm text-gray-500 truncate">{suggestion.description.substring(0, 100)}...</p>
                      <div class="flex items-center mt-1 text-xs text-gray-500">
                        <span>{suggestion.authorName}</span>
                        <span class="mx-1">•</span>
                        <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                        <span class="mx-1">•</span>
                        <div class="flex items-center">
                          <ThumbsUp class="w-3 h-3 mr-1 text-success-600" />
                          <span>{suggestion.upvotes}</span>
                        </div>
                        <span class="mx-1">•</span>
                        <div class="flex items-center">
                          <ThumbsDown class="w-3 h-3 mr-1 text-error-600" />
                          <span>{suggestion.downvotes}</span>
                        </div>
                      </div>
                    </div>
                    
                    {suggestion.status !== "sent" && (
                      <form method="POST">
                        <input type="hidden" name="action" value="send-to-congress" />
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          icon={<Send class="w-4 h-4" />}
                        >
                          Send to Congress
                        </Button>
                      </form>
                    )}
                    
                    {suggestion.status === "sent" && (
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Sent to Congress
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div class="p-4 text-center text-gray-500">
              No popular suggestions yet.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}