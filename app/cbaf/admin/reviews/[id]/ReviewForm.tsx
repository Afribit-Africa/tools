'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';

interface Props {
  videoId: string;
  currentStatus: 'pending' | 'approved' | 'rejected';
  currentComment: string;
  canApprove: boolean;
  canReject: boolean;
}

export default function ReviewForm({ videoId, currentStatus, currentComment, canApprove, canReject }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState(currentComment);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this video?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cbaf/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          action,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} video`);
      }

      // Refresh the page to show updated status
      router.refresh();
      
      // Optionally redirect to reviews list
      // router.push('/cbaf/admin/reviews');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-heading font-bold mb-4">Review Actions</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Review Comment (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add feedback or reasoning for your decision..."
          rows={4}
          disabled={loading}
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent resize-none text-sm disabled:opacity-50"
        />
        <p className="text-xs text-text-muted mt-1">
          This comment will be visible to the BCE user
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {currentStatus === 'pending' ? (
          <>
            {canApprove && (
              <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve Video
                  </>
                )}
              </button>
            )}

            {canReject && (
              <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Video
                  </>
                )}
              </button>
            )}

            {!canApprove && !canReject && (
              <p className="text-sm text-text-muted text-center">
                You don't have permission to review videos
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-text-muted mb-2">
              This video has already been {currentStatus}
            </p>
            {currentComment && (
              <div className="mt-3 p-3 bg-bg-primary rounded text-sm text-left">
                <p className="text-text-muted font-medium mb-1">Previous Comment:</p>
                <p>{currentComment}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Guidelines */}
      {currentStatus === 'pending' && (
        <div className="mt-6 pt-6 border-t border-border-primary">
          <p className="text-xs font-medium mb-2">Review Criteria:</p>
          <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
            <li>Video clearly shows merchants accepting Bitcoin</li>
            <li>Content is original (not a duplicate)</li>
            <li>All tagged merchants are visible in the video</li>
            <li>Video quality is acceptable</li>
            <li>No inappropriate or offensive content</li>
          </ul>
        </div>
      )}
    </div>
  );
}
