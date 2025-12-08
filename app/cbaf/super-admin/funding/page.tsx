import { requireSuperAdmin } from '@/lib/auth/session';
import { getAvailablePeriods, getCurrentPeriod } from '@/lib/cbaf/ranking-calculator';
import { Calculator, TrendingUp, Calendar, CheckCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import CalculateRankingsButton from './CalculateRankingsButton';

export default async function FundingCalculatorPage() {
  await requireSuperAdmin();

  const currentPeriod = getCurrentPeriod();
  const availablePeriods = await getAvailablePeriods();

  // Check if current month has been calculated
  const currentMonthCalculated = availablePeriods.some(p => p.month === currentPeriod.month);

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                <Calculator className="w-8 h-8 text-bitcoin" />
                Rankings & Funding Calculator
              </h1>
              <p className="text-text-secondary mt-1">
                Calculate monthly rankings and prepare funding distribution
              </p>
            </div>
            <Link href="/cbaf/admin" className="btn-secondary">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Month Calculation */}
        <section className="mb-8">
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-bold mb-2">
                  {currentPeriod.monthName} {currentPeriod.year}
                </h2>
                <p className="text-text-muted text-sm">
                  Current ranking period
                </p>
              </div>
              {currentMonthCalculated ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">Calculated</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500 font-medium">Pending</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-bg-primary rounded-lg border border-border-primary">
                <h3 className="font-medium mb-2">What This Does:</h3>
                <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
                  <li>Analyzes all approved videos for the month</li>
                  <li>Calculates metrics: videos, merchants, new discoveries</li>
                  <li>Ranks economies by videos, merchants, and new merchants</li>
                  <li>Computes weighted overall rankings</li>
                  <li>Saves results to database for leaderboard display</li>
                </ul>
              </div>

              <CalculateRankingsButton
                year={currentPeriod.year}
                month={parseInt(currentPeriod.month.split('-')[1])}
                label={`Calculate ${currentPeriod.monthName} ${currentPeriod.year}`}
                isCurrentMonth={true}
              />

              <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                <span className="text-sm text-text-muted">View results after calculation</span>
                <div className="flex gap-2">
                  <Link href="/cbaf/rankings" className="btn-secondary text-sm">
                    View Leaderboard →
                  </Link>
                  {currentMonthCalculated && (
                    <Link href={`/cbaf/super-admin/funding/allocate?period=${currentPeriod.month}`} className="btn-primary text-sm">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Allocate Funding
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Previous Months */}
        {availablePeriods.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-bold mb-4">Previously Calculated Periods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePeriods.map((period) => (
                <div
                  key={period.month}
                  className="bg-bg-secondary border border-border-primary rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold">
                        {period.monthName} {period.year}
                      </h3>
                      <p className="text-xs text-text-muted">Saved rankings</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/cbaf/rankings?period=${period.month}`}
                      className="btn-secondary w-full text-sm"
                    >
                      View Rankings
                    </Link>
                    <Link
                      href={`/cbaf/super-admin/funding/allocate?period=${period.month}`}
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Allocate Funding
                    </Link>
                    <CalculateRankingsButton
                      year={period.year}
                      month={parseInt(period.month.split('-')[1])}
                      label="Recalculate"
                      isCurrentMonth={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Manual Period Calculation */}
        <section>
          <div className="bg-bg-secondary border border-bitcoin/30 rounded-xl p-6">
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Calculate Custom Period
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Calculate rankings for any past month (for historical data or corrections)
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <input
                  type="number"
                  id="custom-year"
                  min="2024"
                  max={new Date().getFullYear()}
                  defaultValue={new Date().getFullYear()}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Month</label>
                <select
                  id="custom-month"
                  className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg"
                  defaultValue={new Date().getMonth() + 1}
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                id="calculate-custom-button"
                className="btn-primary"
                onClick={() => {
                  const year = (document.getElementById('custom-year') as HTMLInputElement).value;
                  const month = (document.getElementById('custom-month') as HTMLSelectElement).value;
                  // This will be handled by client component
                  window.location.href = `/cbaf/super-admin/funding?calculate=${year}-${month}`;
                }}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Rankings
              </button>
            </div>
          </div>
        </section>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-bitcoin/10 border border-bitcoin/30 rounded-xl">
          <h3 className="font-heading font-bold mb-2">💡 Best Practices</h3>
          <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
            <li><strong>End of Month:</strong> Calculate rankings after the month ends when all videos are reviewed</li>
            <li><strong>Recalculation:</strong> You can recalculate any period if new videos are approved retroactively</li>
            <li><strong>Funding:</strong> Rankings determine funding allocation (Phase 7 feature)</li>
            <li><strong>Transparency:</strong> All users can view rankings on the leaderboard</li>
            <li><strong>Historical Data:</strong> Calculate past months to build historical rankings</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
