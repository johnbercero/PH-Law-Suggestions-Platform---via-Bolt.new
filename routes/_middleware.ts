import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getUserFromRequest } from "../utils/auth.ts";
import { User } from "../types/index.ts";

interface State {
  user: User | null;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>
) {
  // Get user from session
  const user = await getUserFromRequest(req);
  ctx.state.user = user;
  
  // Check if route is admin-only
  const url = new URL(req.url);
  if (url.pathname.startsWith("/admin")) {
    // Redirect non-admin users
    if (!user || !user.isAdmin) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/signin?message=You must be an admin to access this page" },
      });
    }
  }
  
  // Check if route requires authentication
  const authRequiredRoutes = [
    "/submit",
    "/profile",
    "/settings",
  ];
  
  if (authRequiredRoutes.some(route => url.pathname.startsWith(route))) {
    if (!user) {
      return new Response(null, {
        status: 302,
        headers: { Location: `/signin?redirectTo=${encodeURIComponent(url.pathname)}` },
      });
    }
    
    // Check if user is approved
    if (!user.isApproved) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/pending-approval" },
      });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/account-blocked" },
      });
    }
  }
  
  return await ctx.next();
}