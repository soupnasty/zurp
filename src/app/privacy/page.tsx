import { BackButton } from "@/components/BackButton";

export const metadata = {
  title: "Privacy Policy — zurp",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-[var(--space-3xl)]">
      <BackButton />

      <article className="mt-[var(--space-lg)] space-y-[var(--space-lg)] text-[var(--text-secondary)]">
        <header>
          <h1 className="text-h1 font-semibold tracking-tight text-[var(--text-primary)]">
            Privacy Policy
          </h1>
          <p className="mt-2">
            <strong className="text-[var(--text-primary)]">Zurp, LLC</strong>
            <br />
            Effective Date: February 9, 2026
            <br />
            Last Updated: February 9, 2026
          </p>
        </header>

        {/* 1. Introduction */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            1. Introduction
          </h2>
          <p>
            Zurp, LLC (&ldquo;zurp,&rdquo; &ldquo;we,&rdquo;
            &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the zurp web
            application and related services (collectively, the
            &ldquo;Service&rdquo;). Zurp is a credit card benefit optimization
            platform that helps you understand, track, and maximize the value of
            your credit card rewards, credits, and perks.
          </p>
          <p>
            This Privacy Policy explains what information we collect, how we use
            it, who we share it with, and what choices you have. It applies to
            all users of the Service, including visitors to zurp.com and users
            who connect their credit card accounts.
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">
              By using zurp, you agree to the collection and use of information
              in accordance with this policy.
            </strong>{" "}
            If you do not agree, please do not use the Service.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            2. Information We Collect
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            2.1 Information You Provide Directly
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Account information:
              </strong>{" "}
              When you create a zurp account, we collect your email address. You
              may also provide a display name.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Card selection:
              </strong>{" "}
              You tell us which credit card(s) you hold (e.g., Chase Sapphire
              Reserve, Amex Gold). We use this to load the correct benefit
              catalog and generate personalized insights. We do not collect your
              card number, CVV, expiration date, or any payment credentials.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Preferences and settings:
              </strong>{" "}
              Your notification preferences, benefit tracking settings, and any
              manual inputs such as self-reported benefit usage (e.g., marking a
              hotel credit as redeemed).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Communications:
              </strong>{" "}
              If you contact us for support or provide feedback, we collect the
              content of those communications.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            2.2 Information Collected Through Plaid
          </h3>
          <p>
            When you connect your credit card account to zurp, we use Plaid,
            Inc. (&ldquo;Plaid&rdquo;) as a secure intermediary to access your
            financial data. You authenticate directly with your financial
            institution through Plaid&apos;s interface &mdash; zurp never sees,
            handles, or stores your bank login credentials.
          </p>
          <p>Through Plaid, we receive:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Transaction history:
              </strong>{" "}
              Up to 24 months of transaction data from your connected credit
              card account, including merchant name, transaction amount, date,
              and Plaid&apos;s categorization (e.g., &ldquo;FOOD_AND_DRINK&rdquo;).
              This is the primary data source for our insight engine.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Account metadata:
              </strong>{" "}
              Account name, type (credit card), institution name, and last four
              digits of the account number. We use this to identify which card
              is connected and display it in the app.
            </li>
          </ul>
          <p>
            We do{" "}
            <strong className="text-[var(--text-primary)]">NOT</strong> receive
            through Plaid: your full card number, CVV, PIN, Social Security
            number, login credentials, account balances, or any information from
            non-credit-card accounts (checking, savings, investment, etc.)
            unless you explicitly connect them.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            2.3 Information Collected Automatically
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Usage data:
              </strong>{" "}
              Pages viewed, features used, insights dismissed or acted upon,
              session duration, and interaction patterns within the app.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Device information:
              </strong>{" "}
              Browser type and version, operating system, screen resolution, and
              device identifiers.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Log data:</strong>{" "}
              IP address, access timestamps, referring URLs, and error logs.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Cookies and similar technologies:
              </strong>{" "}
              We use essential cookies for authentication and session management.
              See Section 8 (Cookies) for details.
            </li>
          </ul>
        </section>

        {/* 3. How We Use Your Information */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            3. How We Use Your Information
          </h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Generate personalized benefit insights
              </strong>{" "}
              &mdash; competitor redirects, unused credit alerts, ROI
              calculations (using transaction history, card selection, and
              benefit catalog)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Track benefit usage
              </strong>{" "}
              &mdash; credit utilization across monthly, semi-annual, and annual
              periods (using transaction history and benefit period rules)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Power the Compare feature
              </strong>{" "}
              &mdash; show what you&apos;d gain or lose by switching cards
              (using transaction history and card benefit catalogs)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Detect spending patterns
              </strong>{" "}
              &mdash; identify recurring subscriptions to surface optimization
              opportunities (using merchant names, amounts, and dates)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Send alerts
              </strong>{" "}
              &mdash; expiring credits, enrollment reminders, and spending cap
              warnings (using benefit period data and user preferences)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Improve the Service
              </strong>{" "}
              &mdash; fix bugs and develop new features (using usage data,
              device info, and aggregated transaction patterns)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Respond to support requests
              </strong>{" "}
              &mdash; communicate with you (using account info and
              communications content)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Prevent fraud and comply with legal obligations
              </strong>{" "}
              &mdash; enforce our Terms of Service (using account info, device
              info, and log data)
            </li>
          </ul>
          <p>
            We do{" "}
            <strong className="text-[var(--text-primary)]">NOT</strong> use your
            data to: make credit decisions, report to credit bureaus, sell to
            advertisers, build advertising profiles, underwrite insurance, or
            evaluate your creditworthiness. Zurp is a benefit optimization tool,
            not a financial product.
          </p>
        </section>

        {/* 4. How We Share Your Information */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            4. How We Share Your Information
          </h2>
          <p>
            <strong className="text-[var(--text-primary)]">
              We do not sell your personal information.
            </strong>{" "}
            We do not share your personal information for cross-context
            behavioral advertising. We do not rent, trade, or otherwise monetize
            your data.
          </p>
          <p>
            We may share information with the following categories of recipients,
            solely for the purposes described:
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.1 Service Providers
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Plaid, Inc.
              </strong>{" "}
              &mdash; financial data aggregation; secure connection between your
              bank and zurp. Plaid returns transaction data and account metadata
              to zurp.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Cloud infrastructure (Vercel, Neon)
              </strong>{" "}
              &mdash; hosting, data storage, and compute. All Service data is
              encrypted at rest and in transit.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Email/notification providers
              </strong>{" "}
              &mdash; delivering alerts and communications. Only email address
              and notification content are shared.
            </li>
          </ul>
          <p>
            All service providers are bound by data processing agreements that
            restrict their use of your data to the specific services they
            provide to us.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.2 Legal and Safety Disclosures
          </h3>
          <p>
            We may disclose your information if we believe in good faith that
            disclosure is necessary to:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Comply with applicable law, regulation, legal process, or
              governmental request
            </li>
            <li>Enforce our Terms of Service or other agreements</li>
            <li>
              Protect the rights, property, or safety of zurp, our users, or
              the public
            </li>
            <li>
              Detect, prevent, or address fraud, security, or technical issues
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.3 Business Transfers
          </h3>
          <p>
            If zurp is involved in a merger, acquisition, reorganization, or
            sale of assets, your information may be transferred as part of that
            transaction. We will notify you via email and/or a prominent notice
            on the Service before your information becomes subject to a
            different privacy policy.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.4 With Your Consent
          </h3>
          <p>
            We may share your information for other purposes with your explicit
            consent.
          </p>
        </section>

        {/* 5. Data Retention */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            5. Data Retention
          </h2>
          <p>
            We retain your information for as long as your account is active or
            as needed to provide the Service. Specific retention periods:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Account information:
              </strong>{" "}
              Duration of account + 30 days after deletion (grace period for
              account recovery)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Transaction data (from Plaid):
              </strong>{" "}
              Duration of account + 30 days after deletion, or up to 24 months
              of history, whichever is shorter
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Derived insights and benefit tracking:
              </strong>{" "}
              Duration of account + 30 days
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Usage and analytics data:
              </strong>{" "}
              Up to 24 months
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Log data:</strong>{" "}
              Up to 12 months
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Support communications:
              </strong>{" "}
              Up to 36 months
            </li>
          </ul>
          <p>
            When you delete your account, we initiate deletion of your personal
            data within 30 days. Some data may persist in encrypted backups for
            up to 90 days before being permanently purged. We may retain
            anonymized, aggregated data that cannot be used to identify you
            indefinitely for statistical and product improvement purposes.
          </p>
        </section>

        {/* 6. Data Security */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            6. Data Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            information:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Encryption in transit:
              </strong>{" "}
              All data transmitted between your browser, zurp&apos;s servers,
              and Plaid is encrypted using TLS 1.2 or higher.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Encryption at rest:
              </strong>{" "}
              All stored data, including transaction records and account
              information, is encrypted using AES-256 encryption. Plaid access
              tokens are encrypted using AES-256-GCM before storage.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Access controls:
              </strong>{" "}
              Access to user data is restricted to authorized personnel on a
              need-to-know basis, protected by multi-factor authentication and
              role-based access controls.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Plaid security:
              </strong>{" "}
              Your bank credentials are handled exclusively by Plaid, which
              maintains SOC 2 Type II certification, uses AES-256 encryption,
              and is regularly audited by independent security firms. Zurp never
              receives or stores your bank login credentials.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Infrastructure:
              </strong>{" "}
              Our infrastructure is hosted on SOC 2-certified cloud providers
              with built-in DDoS protection, automated patching, and continuous
              monitoring.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Incident response:
              </strong>{" "}
              We maintain a security incident response plan. In the event of a
              data breach affecting your personal information, we will notify
              you and relevant authorities in accordance with applicable law.
            </li>
          </ul>
          <p className="italic">
            No method of electronic transmission or storage is 100% secure.
            While we strive to protect your data, we cannot guarantee absolute
            security.
          </p>
        </section>

        {/* 7. Your Rights and Choices */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            7. Your Rights and Choices
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.1 All Users
          </h3>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Access and portability:
              </strong>{" "}
              You can request a copy of the personal information we hold about
              you in a structured, machine-readable format.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Correction:
              </strong>{" "}
              You can update your account information at any time through the
              app settings, or request that we correct inaccurate data.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Deletion:</strong>{" "}
              You can delete your account at any time. This will trigger
              deletion of your personal data as described in Section 5.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Disconnect Plaid:
              </strong>{" "}
              You can disconnect your financial institution at any time through
              the app or through Plaid&apos;s portal (my.plaid.com).
              Disconnecting stops new data from flowing to zurp. You can also
              request deletion of data Plaid holds about you directly through
              Plaid.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Opt out of communications:
              </strong>{" "}
              You can unsubscribe from marketing emails at any time.
              Transactional emails (e.g., security alerts, account changes)
              cannot be opted out of while your account is active.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.2 California Residents (CCPA/CPRA)
          </h3>
          <p>
            If you are a California resident, you have additional rights under
            the California Consumer Privacy Act, as amended by the California
            Privacy Rights Act:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Right to know:
              </strong>{" "}
              You may request the categories and specific pieces of personal
              information we have collected, the sources, the business purposes,
              and the categories of third parties with whom we share it.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Right to delete:
              </strong>{" "}
              You may request deletion of your personal information, subject to
              certain exceptions.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Right to correct:
              </strong>{" "}
              You may request correction of inaccurate personal information.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Right to opt out of sale/sharing:
              </strong>{" "}
              zurp does not sell your personal information and does not share it
              for cross-context behavioral advertising. Therefore, there is no
              sale or sharing to opt out of.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Right to limit use of sensitive personal information:
              </strong>{" "}
              We collect financial account information (transaction data) which
              may be considered sensitive personal information under CPRA. We
              use this data only as necessary to provide the Service as
              described in this policy.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Right to non-discrimination:
              </strong>{" "}
              We will not discriminate against you for exercising any of your
              CCPA/CPRA rights.
            </li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>{" "}
            or use the in-app privacy controls. We will verify your identity
            before processing your request. You may also designate an authorized
            agent to make a request on your behalf.
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">
              Categories of personal information collected in the preceding 12
              months:
            </strong>{" "}
            Identifiers (email, IP address); financial information (transaction
            data, account metadata via Plaid); internet activity (usage data,
            device info); inferences (derived insights, benefit tracking
            calculations).
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.3 European Economic Area, UK, and Swiss Residents
          </h3>
          <p>
            If you are located in the EEA, UK, or Switzerland, you have rights
            under the General Data Protection Regulation (GDPR) or equivalent
            legislation, including the rights to access, rectify, erase,
            restrict processing, data portability, and object to processing. You
            also have the right to lodge a complaint with your local supervisory
            authority.
          </p>
          <p>
            Our legal bases for processing are: performance of our contract with
            you (providing the Service), your consent (where applicable), our
            legitimate interests (improving the Service, preventing fraud), and
            compliance with legal obligations.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.4 Other U.S. State Privacy Rights
          </h3>
          <p>
            Residents of Colorado, Connecticut, Virginia, Utah, Texas, Oregon,
            Montana, and other states with comprehensive privacy laws may have
            similar rights to access, correct, delete, and opt out of certain
            processing. Contact{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>{" "}
            to exercise these rights.
          </p>
        </section>

        {/* 8. Cookies */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            8. Cookies and Tracking Technologies
          </h2>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Essential/Session cookies:
              </strong>{" "}
              Authentication, session management, CSRF protection. Duration:
              session / 30 days. Cannot be disabled (required for the Service to
              function).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Preference cookies:
              </strong>{" "}
              Remembering your settings and display preferences. Duration: 1
              year. Can be disabled via browser settings.
            </li>
          </ul>
          <p>
            <strong className="text-[var(--text-primary)]">
              We do not use advertising cookies or tracking pixels.
            </strong>{" "}
            We do not engage in cross-site tracking. We honor Global Privacy
            Control (GPC) signals and Do Not Track (DNT) browser signals.
          </p>
        </section>

        {/* 9. Third-Party Services */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            9. Third-Party Services and Links
          </h2>
          <p>
            The Service may contain links to third-party websites or services,
            including credit card issuer websites (Chase, American Express,
            etc.), Plaid&apos;s portal, and benefit partner merchants. We are
            not responsible for the privacy practices of these third parties. We
            encourage you to review their privacy policies before providing them
            with your information.
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">Plaid:</strong> When
            you connect your financial account through Plaid, Plaid&apos;s own
            privacy policy (available at{" "}
            <a
              href="https://plaid.com/legal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              plaid.com/legal
            </a>
            ) governs Plaid&apos;s collection and use of your data. You can
            manage your Plaid connections at{" "}
            <a
              href="https://my.plaid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              my.plaid.com
            </a>
            .
          </p>
        </section>

        {/* 10. Children's Privacy */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            10. Children&apos;s Privacy
          </h2>
          <p>
            The Service is not directed to individuals under the age of 18. We
            do not knowingly collect personal information from children. If we
            learn that we have collected personal information from a child under
            18, we will take steps to delete that information promptly. If you
            believe a child has provided us with personal information, please
            contact us at{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>
            .
          </p>
        </section>

        {/* 11. International Data Transfers */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            11. International Data Transfers
          </h2>
          <p>
            Zurp is based in the United States. If you access the Service from
            outside the United States, your information will be transferred to
            and processed in the United States, where data protection laws may
            differ from those in your jurisdiction. Where required, we rely on
            standard contractual clauses, adequacy decisions, or other approved
            transfer mechanisms to ensure appropriate safeguards for
            international transfers.
          </p>
        </section>

        {/* 12. Changes */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            12. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we make
            material changes, we will notify you by email (sent to the address
            associated with your account) and/or by posting a prominent notice
            on the Service at least 30 days before the changes take effect. Your
            continued use of the Service after the effective date constitutes
            acceptance of the updated policy.
          </p>
          <p>
            We encourage you to review this policy periodically. The
            &ldquo;Last Updated&rdquo; date at the top of this document
            indicates when the policy was most recently revised.
          </p>
        </section>

        {/* 13. Contact Us */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            13. Contact Us
          </h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy
            Policy or our data practices, please contact us:
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">Zurp, LLC</strong>
            <br />
            Email:{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>
          </p>
        </section>

        <hr className="border-[var(--border-default)]" />

        <p className="text-[var(--text-caption)]">
          This privacy policy was last updated on February 9, 2026.
        </p>
      </article>
    </div>
  );
}
