import { Attachment, Suggestion, User, Vote } from "../types/index.ts";

// Open Deno KV database
const kv = await Deno.openKv();

// Collection prefixes
const COLLECTIONS = {
  USERS: "users",
  SUGGESTIONS: "suggestions",
  VOTES: "votes",
  AUTH: "auth",
};

// User functions
export async function getUserById(id: string): Promise<User | null> {
  const result = await kv.get([COLLECTIONS.USERS, id]);
  return result.value as User | null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // We need to create a secondary index for email lookups
  const entries = await kv.list({ prefix: [COLLECTIONS.USERS] });
  
  for await (const entry of entries) {
    const user = entry.value as User;
    if (user.email === email) {
      return user;
    }
  }
  
  return null;
}

export async function createUser(user: Omit<User, "id" | "createdAt" | "isAdmin" | "isApproved" | "isBlocked">): Promise<User> {
  const id = crypto.randomUUID();
  const now = new Date();
  
  const newUser: User = {
    id,
    ...user,
    isAdmin: false,
    isApproved: false, // Requires admin approval
    isBlocked: false,
    createdAt: now,
  };
  
  await kv.set([COLLECTIONS.USERS, id], newUser);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;
  
  const updatedUser = { ...user, ...updates };
  await kv.set([COLLECTIONS.USERS, id], updatedUser);
  
  return updatedUser;
}

export async function getAllUsers(): Promise<User[]> {
  const users: User[] = [];
  const entries = await kv.list({ prefix: [COLLECTIONS.USERS] });
  
  for await (const entry of entries) {
    users.push(entry.value as User);
  }
  
  return users;
}

// Suggestion functions
export async function getSuggestionById(id: string): Promise<Suggestion | null> {
  const result = await kv.get([COLLECTIONS.SUGGESTIONS, id]);
  return result.value as Suggestion | null;
}

export async function createSuggestion(
  suggestion: Omit<Suggestion, "id" | "createdAt" | "updatedAt" | "upvotes" | "downvotes" | "status">
): Promise<Suggestion> {
  const id = crypto.randomUUID();
  const now = new Date();
  
  const newSuggestion: Suggestion = {
    id,
    ...suggestion,
    upvotes: 0,
    downvotes: 0,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  
  await kv.set([COLLECTIONS.SUGGESTIONS, id], newSuggestion);
  return newSuggestion;
}

export async function updateSuggestion(id: string, updates: Partial<Suggestion>): Promise<Suggestion | null> {
  const suggestion = await getSuggestionById(id);
  if (!suggestion) return null;
  
  const updatedSuggestion = { 
    ...suggestion, 
    ...updates,
    updatedAt: new Date()
  };
  
  await kv.set([COLLECTIONS.SUGGESTIONS, id], updatedSuggestion);
  return updatedSuggestion;
}

export async function getSuggestions(
  limit = 10,
  offset = 0,
  filters: {
    category?: string;
    status?: string;
    authorId?: string;
    search?: string;
  } = {},
  sort: "newest" | "oldest" | "most-upvoted" | "most-downvoted" = "newest"
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];
  const entries = await kv.list({ prefix: [COLLECTIONS.SUGGESTIONS] });
  
  for await (const entry of entries) {
    suggestions.push(entry.value as Suggestion);
  }
  
  // Apply filters
  let filtered = suggestions;
  
  if (filters.category) {
    filtered = filtered.filter(s => s.category === filters.category);
  }
  
  if (filters.status) {
    filtered = filtered.filter(s => s.status === filters.status);
  }
  
  if (filters.authorId) {
    filtered = filtered.filter(s => s.authorId === filters.authorId);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(search) || 
      s.description.toLowerCase().includes(search)
    );
  }
  
  // Apply sorting
  switch(sort) {
    case "newest":
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "oldest":
      filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      break;
    case "most-upvoted":
      filtered.sort((a, b) => b.upvotes - a.upvotes);
      break;
    case "most-downvoted":
      filtered.sort((a, b) => b.downvotes - a.downvotes);
      break;
  }
  
  // Apply pagination
  return filtered.slice(offset, offset + limit);
}

// Vote functions
export async function getVote(userId: string, suggestionId: string): Promise<Vote | null> {
  const result = await kv.get([COLLECTIONS.VOTES, `${userId}:${suggestionId}`]);
  return result.value as Vote | null;
}

export async function createOrUpdateVote(vote: Vote): Promise<Vote> {
  const key = `${vote.userId}:${vote.suggestionId}`;
  const existingVote = await getVote(vote.userId, vote.suggestionId);
  
  await kv.set([COLLECTIONS.VOTES, key], vote);
  
  // Update the suggestion's vote counts
  const suggestion = await getSuggestionById(vote.suggestionId);
  if (suggestion) {
    const updates: Partial<Suggestion> = {};
    
    if (existingVote) {
      // Changed vote type
      if (existingVote.type !== vote.type) {
        if (vote.type === "upvote") {
          updates.upvotes = suggestion.upvotes + 1;
          updates.downvotes = suggestion.downvotes - 1;
        } else {
          updates.upvotes = suggestion.upvotes - 1;
          updates.downvotes = suggestion.downvotes + 1;
        }
      }
      // Otherwise no change needed
    } else {
      // New vote
      if (vote.type === "upvote") {
        updates.upvotes = suggestion.upvotes + 1;
      } else {
        updates.downvotes = suggestion.downvotes + 1;
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await updateSuggestion(suggestion.id, updates);
    }
  }
  
  return vote;
}

export async function removeVote(userId: string, suggestionId: string): Promise<void> {
  const key = `${userId}:${suggestionId}`;
  const existingVote = await getVote(userId, suggestionId);
  
  if (existingVote) {
    await kv.delete([COLLECTIONS.VOTES, key]);
    
    // Update the suggestion's vote count
    const suggestion = await getSuggestionById(suggestionId);
    if (suggestion) {
      const updates: Partial<Suggestion> = {};
      
      if (existingVote.type === "upvote") {
        updates.upvotes = suggestion.upvotes - 1;
      } else {
        updates.downvotes = suggestion.downvotes - 1;
      }
      
      await updateSuggestion(suggestion.id, updates);
    }
  }
}

export async function getUserVotes(userId: string): Promise<Vote[]> {
  const votes: Vote[] = [];
  const entries = await kv.list({ prefix: [COLLECTIONS.VOTES] });
  
  for await (const entry of entries) {
    const vote = entry.value as Vote;
    if (vote.userId === userId) {
      votes.push(vote);
    }
  }
  
  return votes;
}

// Helper for auth
export async function saveSession(sessionId: string, userId: string, expiresAt: Date): Promise<void> {
  await kv.set([COLLECTIONS.AUTH, sessionId], {
    userId,
    expiresAt,
  });
}

export async function getSession(sessionId: string): Promise<{ userId: string; expiresAt: Date } | null> {
  const result = await kv.get([COLLECTIONS.AUTH, sessionId]);
  const session = result.value as { userId: string; expiresAt: Date } | null;
  
  if (!session) return null;
  
  // Check if session is expired
  if (new Date() > new Date(session.expiresAt)) {
    await kv.delete([COLLECTIONS.AUTH, sessionId]);
    return null;
  }
  
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await kv.delete([COLLECTIONS.AUTH, sessionId]);
}