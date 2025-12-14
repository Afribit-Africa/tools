'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

  const handleAction = async (action: 'approve' | 'reject') => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cbaf/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          action: pendingAction,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${pendingAction} video`);
      }

      // Refresh the page to show updated status
      router.refresh();

      // Optionally redirect to reviews list
      // router.push('/cbaf/admin/reviews');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        onConfirm={confirmAction}
        title={`${pendingAction === 'approve' ? 'Approve' : 'Reject'} Video?`}
        message={`Are you sure you want to ${pendingAction} this video? ${comment.trim() ? 'Your comment will be sent to the BCE user.' : 'Consider adding a comment to explain your decision.'}`}
        confirmText={pendingAction === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        variant={pendingAction === 'approve' ? 'success' : 'danger'}
        icon={
          pendingAction === 'approve' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )
        }
      />

      <div className="card">
      <h2 className="text-lg font-heading font-bold mb-4 text-gray-900">Review Actions</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Comment */}
      <div className="mb-4">
        <label className="label flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Review Comment (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add feedback or reasoning for your decision..."
          rows={4}
          disabled={loading}
          className="textarea"
        />
        <p className="helper-text">
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
                className="btn-primary w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
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
                className="btn-danger w-full flex items-center justify-center gap-2"
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
              <p className="text-sm text-gray-500 text-center">
                You don't have permission to review videos
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">
              This video has already been {currentStatus}
            </p>
            {currentComment && (
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-left">
                <p className="text-gray-600 font-medium mb-1">Previous Comment:</p>
                <p className="text-gray-900">{currentComment}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Guidelines */}
      {currentStatus === 'pending' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs font-medium mb-2 text-gray-900">Review Criteria:</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Video clearly shows merchants accepting Bitcoin</li>
            <li>Content is original (not a duplicate)</li>
            <li>All tagged merchants are visible in the video</li>
            <li>Video quality is acceptable</li>
            <li>No inappropriate or offensive content</li>
          </ul>
        </div>
      )}
    </div>
    </>
  );
}
