'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

interface Video {
  id: string;
  videoTitle: string | null;
  status: string;
  submissionMonth: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  economy: {
    id: string;
    economyName: string;
  } | null;
}

interface RecentSubmissionsProps {
  videos: Video[];
}

const ITEMS_PER_PAGE = 10;

export default function RecentSubmissions({ videos }: RecentSubmissionsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVideos = videos.slice(startIndex, endIndex);

  const statusConfig = {
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200'
    }
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Eye className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500 font-medium">No submissions yet</p>
        <p className="text-sm text-gray-400">Video submissions will appear here</p>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                Video Title
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                Economy
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">
                Status
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">
                Submitted
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentVideos.map((video) => {
              const config = statusConfig[video.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {video.videoTitle}
                    </div>
                    <div className="text-sm text-gray-500">
                      {video.submissionMonth}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-700">
                      {video.economy?.economyName || 'Unknown'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                        border ${config.border} ${config.bg} ${config.text}
                        text-xs font-semibold
                      `}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-sm text-gray-700">
                      {format(new Date(video.submittedAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(video.submittedAt), 'HH:mm')}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/cbaf/admin/reviews/${video.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-bitcoin-600 hover:text-bitcoin-700 hover:bg-bitcoin-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t-2 border-gray-100 pt-6">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, videos.length)} of {videos.length} submissions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border-2 border-gray-200 hover:border-bitcoin-300 hover:bg-bitcoin-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`
                    min-w-[40px] h-10 rounded-lg font-medium text-sm transition-all
                    ${currentPage === page
                      ? 'bg-bitcoin-500 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-bitcoin-300 hover:bg-bitcoin-50'
                    }
                  `}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border-2 border-gray-200 hover:border-bitcoin-300 hover:bg-bitcoin-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
