import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Afribitools',
  description: 'Privacy policy for Afribitools platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-heading font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-text-secondary mb-6">
            Last updated: December 14, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-text-secondary mb-4">
              When you use Afribitools, we collect the following information:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Google account information (email, name, profile picture) when you sign in</li>
              <li>Economy and merchant data you provide through the platform</li>
              <li>Video URLs and associated merchant information</li>
              <li>Lightning network payment addresses</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-text-secondary mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Provide and maintain the Afribitools platform</li>
              <li>Authenticate and authorize user access</li>
              <li>Process and facilitate Bitcoin payments</li>
              <li>Verify merchant information via BTCMap</li>
              <li>Calculate and distribute funding allocations</li>
              <li>Send email notifications and updates</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
            <p className="text-text-secondary mb-4">
              Your data is stored securely using:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Encrypted database connections (SSL/TLS)</li>
              <li>Secure authentication via Google OAuth</li>
              <li>Encryption for sensitive data like API keys</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="text-text-secondary mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li><strong>Google OAuth:</strong> For authentication</li>
              <li><strong>BTCMap API:</strong> For merchant verification</li>
              <li><strong>Blink:</strong> For Bitcoin Lightning payments</li>
              <li><strong>Neon Database:</strong> For data storage</li>
              <li><strong>Gmail SMTP:</strong> For email notifications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-text-secondary mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Bitcoin and Lightning Network</h2>
            <p className="text-text-secondary mb-4">
              Please note that Bitcoin and Lightning Network transactions are:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Pseudonymous and recorded on public blockchains</li>
              <li>Irreversible once confirmed</li>
              <li>Subject to network fees and processing times</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-text-secondary mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-text-secondary">
              Email: <a href="mailto:support@afribit.africa" className="text-brand-primary hover:text-brand-primary-hover">support@afribit.africa</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-text-secondary">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
