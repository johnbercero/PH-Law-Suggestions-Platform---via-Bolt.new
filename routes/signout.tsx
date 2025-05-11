import { Handlers } from "$fresh/server.ts";
import { clearUserSession } from "../utils/auth.ts";

export const handler: Handlers = {
  GET(_req, _ctx) {
    const response = new Response(null, {
      status: 303,
      headers: { Location: "/" },
    });
    
    clearUserSession(response);
    return response;
  },
};