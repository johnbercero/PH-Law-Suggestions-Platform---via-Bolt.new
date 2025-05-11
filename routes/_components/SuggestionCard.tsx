import { useState } from "preact/hooks";
import { User, Suggestion, Attachment } from "../../types/index.ts";
import { ThumbsUp, ThumbsDown, Calendar, Users, Paperclip, FileText, Image, Film } from "icons/";

interface SuggestionCardProps {
  suggestion: Suggestion;
  currentUser: User | null;
  userVote?: 'upvote' | 'downvote' | null;
  onVote: (type: 'upvote' | 'downvote') => void;
  className?: string;
}

export default function SuggestionCard({ 
  suggestion, 
  currentUser, 
  userVote, 
  onVote,
  className = "" 
}: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      case 'sent':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      case 'sent':
        return 'Sent to Congress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const renderAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image class="w-4 h-4" />;
      case 'video':
        return <Film class="w-4 h-4" />;
      case 'document':
        return <FileText class="w-4 h-4" />;
      default:
        return <Paperclip class="w-4 h-4" />;
    }
  };
  
  return (
    <div class={`bg-white shadow rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <div class="p-5">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(suggestion.status)}`}>
            {getStatusLabel(suggestion.status)}
          </span>
        </div>
        
        <div class="mt-2">
          <p class="text-gray-700">
            {isExpanded 
              ? suggestion.description 
              : truncateText(suggestion.description, 150)}
          </p>
          {suggestion.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              class="mt-1 text-primary-600 hover:text-primary-800 text-sm font-medium focus:outline-none"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
        
        {suggestion.attachments && suggestion.attachments.length > 0 && (
          <div class="mt-3">
            <p class="text-sm text-gray-500 mb-2">Attachments:</p>
            <div class="flex flex-wrap gap-2">
              {suggestion.attachments.map((attachment: Attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  {renderAttachmentIcon(attachment.type)}
                  <span class="ml-1">{truncateText(attachment.filename, 15)}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        <div class="mt-4 flex items-center text-sm text-gray-500">
          <div class="flex items-center">
            <Calendar class="w-4 h-4 mr-1" />
            <span>{formatDate(suggestion.createdAt)}</span>
          </div>
          <span class="mx-2">•</span>
          <div class="flex items-center">
            <Users class="w-4 h-4 mr-1" />
            <span>{suggestion.authorName}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-200">
        <div class="flex space-x-4">
          <button
            onClick={() => onVote('upvote')}
            disabled={!currentUser}
            class={`inline-flex items-center py-1 px-2 rounded ${
              userVote === 'upvote'
                ? 'bg-success-100 text-success-700'
                : 'hover:bg-gray-100 text-gray-700'
            } ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={currentUser ? 'Upvote' : 'Sign in to vote'}
          >
            <ThumbsUp class="w-5 h-5 mr-1" />
            <span>{suggestion.upvotes}</span>
          </button>
          
          <button
            onClick={() => onVote('downvote')}
            disabled={!currentUser}
            class={`inline-flex items-center py-1 px-2 rounded ${
              userVote === 'downvote'
                ? 'bg-error-100 text-error-700'
                : 'hover:bg-gray-100 text-gray-700'
            } ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={currentUser ? 'Downvote' : 'Sign in to vote'}
          >
            <ThumbsDown class="w-5 h-5 mr-1" />
            <span>{suggestion.downvotes}</span>
          </button>
        </div>
        
        <a
          href={`/suggestion/${suggestion.id}`}
          class="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          View Details
        </a>
      </div>
    </div>
  );
}