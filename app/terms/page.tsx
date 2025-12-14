import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Afribitools',
  description: 'Terms of service for Afribitools platform',
};

export default function TermsPage() {
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

        <h1 className="text-4xl font-heading font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-text-secondary mb-6">
            Last updated: December 14, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-text-secondary mb-4">
              By accessing and using Afribitools ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-text-secondary mb-4">
              Afribitools provides tools for Bitcoin circular economy organizations, including:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Merchant registration and verification</li>
              <li>Video content submission and review</li>
              <li>Lightning Network payment processing</li>
              <li>Funding calculation and distribution</li>
              <li>Economy rankings and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-text-secondary mb-4">
              To use the Platform, you must:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Sign in with a valid Google account</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Promptly update your information if it changes</li>
              <li>Not share your account credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Roles and Responsibilities</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Bitcoin Circular Economy (BCE) Users</h3>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mb-4">
              <li>Register and manage merchants in your economy</li>
              <li>Submit video content featuring merchants</li>
              <li>Ensure merchant information is accurate and up-to-date</li>
              <li>Comply with BTCMap verification requirements</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Admin Users</h3>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mb-4">
              <li>Review and approve/reject video submissions</li>
              <li>Verify merchant information</li>
              <li>Manage funding allocations</li>
              <li>Use admin privileges responsibly</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Super Admin Users</h3>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Configure funding parameters</li>
              <li>Process Lightning payments</li>
              <li>Manage system settings</li>
              <li>Access all platform features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Bitcoin Payments</h2>
            <p className="text-text-secondary mb-4">
              When using the Platform for Bitcoin payments:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Verify all payment addresses before sending funds</li>
              <li>Understand that Bitcoin transactions are irreversible</li>
              <li>Accept responsibility for transaction fees</li>
              <li>Acknowledge network delays may occur</li>
              <li>Use supported payment providers (Blink, Fedi, Machankura)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Content Guidelines</h2>
            <p className="text-text-secondary mb-4">
              When submitting videos and merchant information:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Ensure all content is accurate and truthful</li>
              <li>Do not submit misleading or fraudulent information</li>
              <li>Respect intellectual property rights</li>
              <li>Do not include offensive or inappropriate content</li>
              <li>Verify merchant consent before featuring them</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
            <p className="text-text-secondary mb-4">
              You may not:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Use the Platform for illegal activities</li>
              <li>Attempt to gain unauthorized access to the system</li>
              <li>Submit false or duplicate merchant information</li>
              <li>Manipulate rankings or funding calculations</li>
              <li>Interfere with other users' access to the Platform</li>
              <li>Scrape or automatically collect data from the Platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
            <p className="text-text-secondary mb-4">
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy of all information</li>
              <li>Security of Bitcoin transactions</li>
              <li>Availability of third-party services (BTCMap, Blink, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-text-secondary mb-4">
              We are not liable for:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Lost or stolen Bitcoin</li>
              <li>Incorrect payment addresses</li>
              <li>Network delays or failures</li>
              <li>Third-party service disruptions</li>
              <li>Data loss or corruption</li>
              <li>Indirect or consequential damages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-text-secondary mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
              <li>Suspend or terminate accounts that violate these terms</li>
              <li>Remove content that violates our guidelines</li>
              <li>Modify or discontinue services at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-text-secondary mb-4">
              We may update these Terms of Service at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-text-secondary mb-4">
              These terms are governed by the laws of the jurisdiction where Afribit Africa operates.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-text-secondary mb-4">
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="text-text-secondary">
              Email: <a href="mailto:support@afribit.africa" className="text-brand-primary hover:text-brand-primary-hover">support@afribit.africa</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
