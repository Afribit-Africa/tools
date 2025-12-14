'use client';

import { useState } from 'react';
import { Trophy, Medal, Award, Video, Users, TrendingUp, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface Ranking {
  economyId: string;
  economyName: string;
  videosApproved: number;
  videosSubmitted: number;
  merchantsTotal: number;
  merchantsNew: number;
  approvalRate: number;
  rankByVideos: number;
  rankByMerchants: number;
  rankByNewMerchants: number;
  overallRank: number;
  overallScore: number;
}

interface RankingsTableProps {
  rankings: Ranking[];
}

const ITEMS_PER_PAGE = 15;

export default function RankingsTable({ rankings }: RankingsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'overall' | 'videos' | 'merchants' | 'new'>('overall');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort rankings
  const sortedRankings = [...rankings].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'overall':
        compareValue = a.overallRank - b.overallRank;
        break;
      case 'videos':
        compareValue = b.videosApproved - a.videosApproved;
        break;
      case 'merchants':
        compareValue = b.merchantsTotal - a.merchantsTotal;
        break;
      case 'new':
        compareValue = b.merchantsNew - a.merchantsNew;
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const totalPages = Math.ceil(sortedRankings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRankings = sortedRankings.slice(startIndex, endIndex);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-bitcoin-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-bitcoin-500 to-orange-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Trophy className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500 font-medium">No rankings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 border-2 border-gray-100">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Sort by:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSort('overall')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sortBy === 'overall'
                ? 'bg-bitcoin-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overall Rank
          </button>
          <button
            onClick={() => handleSort('videos')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sortBy === 'videos'
                ? 'bg-bitcoin-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => handleSort('merchants')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sortBy === 'merchants'
                ? 'bg-bitcoin-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Merchants
          </button>
          <button
            onClick={() => handleSort('new')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sortBy === 'new'
                ? 'bg-bitcoin-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            New Discoveries
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-100 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="text-left p-4 font-bold text-gray-700">Rank</th>
                <th className="text-left p-4 font-bold text-gray-700">Economy</th>
                <th className="text-center p-4 font-bold text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    Videos
                  </div>
                </th>
                <th className="text-center p-4 font-bold text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Merchants
                  </div>
                </th>
                <th className="text-center p-4 font-bold text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    New
                  </div>
                </th>
                <th className="text-center p-4 font-bold text-gray-700">Approval Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRankings.map((ranking) => (
                <tr
                  key={ranking.economyId}
                  className={`hover:bg-gray-50 transition-colors ${
                    ranking.overallRank <= 3 ? 'bg-gradient-to-r from-bitcoin-50/50 to-orange-50/30' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(ranking.overallRank)}
                      <span className={`
                        px-3 py-1.5 rounded-lg font-bold text-sm
                        ${getRankBadgeColor(ranking.overallRank)}
                      `}>
                        #{ranking.overallRank}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{ranking.economyName}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{ranking.videosApproved}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        Rank #{ranking.rankByVideos}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{ranking.merchantsTotal}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        Rank #{ranking.rankByMerchants}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div>
                      <div className="font-bold text-lg text-green-600">{ranking.merchantsNew}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        Rank #{ranking.rankByNewMerchants}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm font-bold text-blue-700">
                        {ranking.approvalRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border-2 border-gray-100">
          <div className="text-sm text-gray-600 font-medium">
            Showing {startIndex + 1} to {Math.min(endIndex, rankings.length)} of {rankings.length} economies
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
                    min-w-[40px] h-10 rounded-lg font-bold text-sm transition-all
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
    </div>
  );
}
