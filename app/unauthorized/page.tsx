import Link from 'next/link';
import { ShieldX, Home, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="mb-6 inline-block">
          <div className="p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-xl">
            <ShieldX className="w-20 h-20 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-heading font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          You don't have permission to access this page.
          <br />
          <span className="text-gray-500 text-base">Contact an administrator if you believe this is an error.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Homepage
          </Link>

          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-bitcoin-500 hover:text-bitcoin-600 hover:shadow-md transition-all duration-200"
          >
            <LogIn className="w-4 h-4" />
            Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
