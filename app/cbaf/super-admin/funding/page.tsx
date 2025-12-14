import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getAvailablePeriods, getCurrentPeriod } from '@/lib/cbaf/ranking-calculator';
import { Calculator, TrendingUp, Calendar, CheckCircle, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import CalculateRankingsButton from './CalculateRankingsButton';
import CustomPeriodCalculator from './CustomPeriodCalculator';
import FloatingNav from '@/components/ui/FloatingNav';

export default async function FundingCalculatorPage() {
  const session = await requireAdmin();

  // Restrict to super_admin only for payment operations
  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  const currentPeriod = getCurrentPeriod();
  const availablePeriods = await getAvailablePeriods();

  // Check if current month has been calculated
  const currentMonthCalculated = availablePeriods.some(p => p.month === currentPeriod.month);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Hero Header */}
      <header className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-xl pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Calculator className="w-8 h-8" />
                </div>
                Rankings Calculator
              </h1>
              <p className="text-bitcoin-50 text-lg">
                Calculate monthly rankings and prepare funding distribution
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Current Month - Elevated Card */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-bitcoin-50 to-orange-50 px-6 py-5 border-b-2 border-gray-100 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="w-6 h-6 text-bitcoin-600" />
                    <h2 className="text-2xl font-heading font-bold text-gray-900">
                      {currentPeriod.monthName} {currentPeriod.year}
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    Current ranking period
                  </p>
                </div>
                {currentMonthCalculated ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-green-300 rounded-xl shadow-sm">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 font-bold">Calculated</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 border-2 border-yellow-300 rounded-xl shadow-sm">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-yellow-700 font-bold">Pending</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* What It Does */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
                  <h3 className="font-bold mb-3 text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    How It Works
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Analyzes all approved videos for the month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Calculates metrics: videos, merchants, new discoveries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Ranks economies with weighted overall scores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Saves results for leaderboard display</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-bitcoin-50 to-orange-50 rounded-xl p-5 border-2 border-bitcoin-200">
                  <h3 className="font-bold mb-3 text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-bitcoin-600" />
                    Quick Stats
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-bold text-gray-900">
                        {currentMonthCalculated ? '✅ Ready' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-bold text-gray-900">{currentPeriod.month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-bold text-gray-900">Current</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <CalculateRankingsButton
                year={currentPeriod.year}
                month={parseInt(currentPeriod.month.split('-')[1])}
                label={`Calculate ${currentPeriod.monthName} ${currentPeriod.year}`}
                isCurrentMonth={true}
              />

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-gray-100">
                <span className="text-sm text-gray-500 font-medium">View results after calculation</span>
                <div className="flex gap-3">
                  <Link
                    href="/cbaf/rankings"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-bitcoin-300 hover:bg-bitcoin-50 transition-all"
                  >
                    View Leaderboard →
                  </Link>
                  {currentMonthCalculated && (
                    <Link
                      href={`/cbaf/super-admin/funding/allocate?period=${currentPeriod.month}`}
                      className="px-4 py-2 text-sm font-semibold text-white bg-bitcoin-500 rounded-xl hover:bg-bitcoin-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Allocate Funding
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Previously Calculated Periods */}
        {availablePeriods.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Previously Calculated</h2>
              <span className="text-sm text-gray-500 font-medium">{availablePeriods.length} periods</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePeriods.map((period) => (
                <div
                  key={period.month}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-bitcoin-300 shadow-md hover:shadow-xl transition-all p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-gray-900 group-hover:text-bitcoin-600 transition-colors">
                        {period.monthName} {period.year}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-1">Rankings available</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/cbaf/rankings?period=${period.month}`}
                      className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
                    >
                      View Rankings
                    </Link>
                    <Link
                      href={`/cbaf/super-admin/funding/allocate?period=${period.month}`}
                      className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-bitcoin-500 rounded-lg hover:bg-bitcoin-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Allocate Funding
                    </Link>
                    <div className="pt-2 border-t border-gray-100">
                      <CalculateRankingsButton
                        year={period.year}
                        month={parseInt(period.month.split('-')[1])}
                        label="Recalculate"
                        isCurrentMonth={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Period Calculator */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-bitcoin-200">
            <div className="bg-gradient-to-r from-bitcoin-500 to-orange-500 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2 text-white">
                <TrendingUp className="w-6 h-6" />
                Calculate Custom Period
              </h2>
              <p className="text-bitcoin-50 text-sm mt-1">
                Calculate rankings for any past month (historical data or corrections)
              </p>
            </div>

            <div className="p-6">
              <CustomPeriodCalculator currentYear={currentPeriod.year} />
            </div>
          </div>
        </section>

        {/* Best Practices Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
          <h3 className="font-heading font-bold mb-4 text-gray-900 flex items-center gap-2 text-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              💡
            </div>
            Best Practices
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">End of Month</h4>
                <p className="text-sm text-gray-600">Calculate rankings after the month ends when all videos are reviewed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Recalculation</h4>
                <p className="text-sm text-gray-600">You can recalculate any period if new videos are approved retroactively</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Funding Impact</h4>
                <p className="text-sm text-gray-600">Rankings determine funding allocation for CBAF program</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                4
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Transparency</h4>
                <p className="text-sm text-gray-600">All users can view rankings on the public leaderboard</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
