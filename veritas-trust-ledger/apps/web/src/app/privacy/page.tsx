'use client';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem', color: 'var(--white)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--gold-2)', marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: 13 }}>
        Effective date: March 1, 2026 · Last updated: March 14, 2026
      </p>

      {[
        {
          title: '1. Information We Collect',
          body: `When you register, we collect your name, email address, and password (stored as a secure hash — we never see the plaintext). 
When you complete jobs or escrow transactions, we record transaction data including amounts, dates, parties, and outcomes. This forms your Veritas Trust Ledger — a permanent, portable reputation record.
We collect device information and usage data (screens visited, features used) to improve the platform. We do not sell this data.`,
        },
        {
          title: '2. How We Use Your Information',
          body: `Your information is used to:
• Create and maintain your Veritas TruScore and trust ledger
• Process escrow payments securely through Stripe
• Facilitate communication between workers and clients
• Detect and prevent fraud, manipulation, and abuse
• Send notifications about your jobs, escrow, and disputes
• Improve the platform through aggregated analytics`,
        },
        {
          title: '3. Payment Information',
          body: `Veritas does not store your card numbers or bank details. All payment processing is handled by Stripe, Inc., a PCI-DSS Level 1 certified payment processor. 
For worker payouts, we use Stripe Connect. Your bank account information is stored and managed entirely by Stripe, subject to their privacy policy at stripe.com/privacy.
Veritas retains a 2.5% platform fee on each escrow release.`,
        },
        {
          title: '4. Trust Score and Reputation Data',
          body: `Your TruScore, transaction history, and reputation data are core to the Veritas platform. This data is:
• Visible to other users when they view your profile
• Portable — you can export your full trust ledger at any time
• Permanent — completed transactions cannot be deleted (this guarantees the integrity of your reputation)
• Cryptographically signed to prevent tampering`,
        },
        {
          title: '5. Data Sharing',
          body: `We do not sell your personal data. We share data only with:
• Stripe — for payment processing and worker payouts
• Expo — for push notifications (device token only)
• Law enforcement — only when legally required
• Other users — limited to your public profile, TruScore, and transaction outcomes`,
        },
        {
          title: '6. Data Retention',
          body: `Account data is retained as long as your account is active. Ledger transactions are permanent by design. If you delete your account, your profile becomes anonymous but transaction records remain to preserve the integrity of other users' ledgers.`,
        },
        {
          title: '7. Security',
          body: `We use industry-standard security measures: TLS encryption in transit, AES-256 encryption at rest for sensitive vault data, bcrypt password hashing, JWT authentication with 30-day expiry, and cryptographic signing of all ledger events.`,
        },
        {
          title: '8. Your Rights',
          body: `You can: view all your data in the app, export your trust ledger, update your profile at any time, and request account deletion by emailing privacy@veritas-ledger.com. Residents of California (CCPA) and EU/UK (GDPR) have additional rights — contact us to exercise them.`,
        },
        {
          title: '9. Push Notifications',
          body: `With your permission, we send push notifications for escrow events, messages, disputes, and trust score updates. You can disable notifications in the app settings or your device settings at any time.`,
        },
        {
          title: '10. Contact',
          body: `Privacy questions: privacy@veritas-ledger.com
Platform support: support@veritas-ledger.com
Address: Veritas Trust Ledger LLC, United States`,
        },
      ].map(s => (
        <section key={s.title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cyan-2)', marginBottom: 10 }}>{s.title}</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.body}</p>
        </section>
      ))}
    </div>
  );
}
