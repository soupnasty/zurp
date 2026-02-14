import { BackButton } from "@/components/BackButton";

export const metadata = {
  title: "Terms of Service — zurp",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-[var(--space-3xl)]">
      <BackButton />

      <article className="mt-[var(--space-lg)] space-y-[var(--space-lg)] text-[var(--text-secondary)]">
        <header>
          <h1 className="text-h1 font-semibold tracking-tight text-[var(--text-primary)]">
            Terms of Service
          </h1>
          <p className="mt-2">
            <strong className="text-[var(--text-primary)]">zurp, LLC</strong>
            <br />
            Effective Date: February 9, 2026
            <br />
            Last Updated: February 9, 2026
          </p>
        </header>

        {/* 1. Agreement to Terms */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            1. Agreement to Terms
          </h2>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally
            binding agreement between you (&ldquo;you&rdquo; or
            &ldquo;User&rdquo;) and zurp, LLC (&ldquo;zurp,&rdquo;
            &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These
            Terms govern your access to and use of the zurp web application,
            website (zurp.com), and all related services, features, and content
            (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">
              By creating an account, connecting a credit card, or otherwise
              accessing or using the Service, you agree to be bound by these
              Terms.
            </strong>{" "}
            If you do not agree to these Terms, you must not use the Service.
          </p>
          <p>
            We may update these Terms from time to time. If we make material
            changes, we will notify you by email or by posting a prominent
            notice on the Service at least 30 days before the changes take
            effect. Your continued use of the Service after the updated Terms
            become effective constitutes your acceptance of the changes. If you
            do not agree to the updated Terms, you must stop using the Service.
          </p>
        </section>

        {/* 2. Description of the Service */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            2. Description of the Service
          </h2>
          <p>
            Zurp is a credit card benefit optimization platform. The Service
            helps you understand, track, and maximize the value of your credit
            card rewards, credits, and perks by:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">
                Tracking benefit usage:
              </strong>{" "}
              Monitoring your credit card transactions (via Plaid) to calculate
              which benefits you have used, how much value you have captured,
              and which benefits remain unused or underused within their
              applicable periods.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Generating personalized insights:
              </strong>{" "}
              Producing actionable, dollar-denominated recommendations based on
              your spending patterns and your card&apos;s specific benefit
              catalog &mdash; including competitor redirect suggestions, unused
              credit alerts, expiration warnings, enrollment reminders, and ROI
              calculations.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Comparing card value:
              </strong>{" "}
              Analyzing what you would gain or lose by switching to a different
              supported credit card based on your actual spending history.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Providing benefit information:
              </strong>{" "}
              Displaying your card&apos;s complete benefit catalog including
              hard credits, points multipliers, insurance coverages, and partner
              perks, along with their terms, periods, and activation
              requirements.
            </li>
          </ul>
          <p>
            <strong className="text-[var(--text-primary)]">
              The Service is an informational and analytical tool. It is not a
              financial advisor, credit counselor, investment advisor, or
              insurance broker.
            </strong>{" "}
            See Section 9 (Disclaimers) for important limitations.
          </p>
        </section>

        {/* 3. Eligibility */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            3. Eligibility
          </h2>
          <p>To use the Service, you must:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Be at least 18 years of age (or the age of majority in your
              jurisdiction, whichever is greater);
            </li>
            <li>Be capable of forming a binding legal agreement;</li>
            <li>
              Not be barred from using the Service under applicable law;
            </li>
            <li>
              Reside in a jurisdiction where the Service is available.
            </li>
          </ul>
          <p>
            By using the Service, you represent and warrant that you meet all
            eligibility requirements.
          </p>
        </section>

        {/* 4. Account Registration and Security */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            4. Account Registration and Security
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.1 Account Creation
          </h3>
          <p>
            To access most features of the Service, you must create an account
            by providing a valid email address. We use email-based magic links
            for authentication &mdash; no password is required. You agree to
            provide accurate, current, and complete information during
            registration and to update that information as necessary.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.2 Account Security
          </h3>
          <p>
            You are responsible for maintaining the security of your account.
            You agree to:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Not share your account access or magic link emails with any third
              party;
            </li>
            <li>
              Maintain sole access to the email address associated with your
              account;
            </li>
            <li>
              Notify us immediately at{" "}
              <a
                href="mailto:support@zurp.com"
                className="text-[var(--accent)] hover:opacity-80"
              >
                support@zurp.com
              </a>{" "}
              if you suspect unauthorized access to your account;
            </li>
            <li>
              Accept responsibility for all activity that occurs under your
              account, except to the extent caused by our breach of these Terms
              or our negligence.
            </li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that we
            reasonably believe have been compromised.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            4.3 One Account Per Person
          </h3>
          <p>
            Each account is for a single individual. You may not create multiple
            accounts. You may not transfer your account to another person
            without our prior written consent.
          </p>
        </section>

        {/* 5. Connecting Your Financial Accounts */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            5. Connecting Your Financial Accounts
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.1 Plaid Integration
          </h3>
          <p>
            The Service uses Plaid, Inc. (&ldquo;Plaid&rdquo;) to establish a
            secure, read-only connection to your credit card account(s). When
            you connect an account:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-2">
            <li>
              You authenticate directly with your financial institution through
              Plaid&apos;s interface.{" "}
              <strong className="text-[var(--text-primary)]">
                Zurp never receives, sees, or stores your bank login
                credentials.
              </strong>
            </li>
            <li>
              You authorize Plaid to retrieve and transmit to zurp: transaction
              history (up to 24 months) and account metadata (account name,
              type, institution, last four digits).
            </li>
            <li>
              You acknowledge that your use of Plaid is subject to Plaid&apos;s
              own End User Privacy Policy (available at{" "}
              <a
                href="https://plaid.com/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:opacity-80"
              >
                plaid.com/legal
              </a>
              ), and you agree to that policy.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.2 Read-Only Access
          </h3>
          <p>
            Zurp&apos;s connection to your financial accounts is strictly{" "}
            <strong className="text-[var(--text-primary)]">read-only</strong>.
            The Service cannot initiate transactions, move funds, make payments,
            modify your account settings, or take any action on your financial
            accounts. We can only view the data you have authorized.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.3 Data Accuracy
          </h3>
          <p>
            Transaction data is provided to zurp by Plaid, which retrieves it
            from your financial institution. While we strive for accuracy, we do
            not guarantee that transaction data, merchant categorizations, or
            benefit tracking calculations will be 100% accurate at all times.
            Discrepancies may arise from delays in transaction posting, merchant
            name variations, categorization differences between financial
            institutions, or limitations in Plaid&apos;s data coverage.
          </p>
          <p>
            You are responsible for verifying the accuracy of any information
            provided by the Service before taking action based on it &mdash;
            particularly before making spending decisions, switching credit
            cards, or filing benefit claims with your card issuer.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            5.4 Disconnecting Accounts
          </h3>
          <p>
            You may disconnect your financial accounts at any time through the
            zurp app settings or directly through Plaid&apos;s portal at{" "}
            <a
              href="https://my.plaid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-80"
            >
              my.plaid.com
            </a>
            . Disconnecting an account will stop new data from flowing to zurp
            but will not automatically delete historical data already processed.
            To delete your data, see Section 12 (Account Termination).
          </p>
        </section>

        {/* 6. Acceptable Use */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            6. Acceptable Use
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            6.1 Permitted Use
          </h3>
          <p>
            You may use the Service only for its intended purpose: personal,
            non-commercial analysis and optimization of your own credit card
            benefits. You agree to use the Service in compliance with all
            applicable laws and regulations.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            6.2 Prohibited Conduct
          </h3>
          <p>You agree not to:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Use the Service for any unlawful purpose or in violation of any
              applicable law or regulation;
            </li>
            <li>
              Access or attempt to access another person&apos;s account or
              financial data;
            </li>
            <li>
              Connect financial accounts that you do not own or are not legally
              authorized to manage;
            </li>
            <li>
              Use the Service to commit or facilitate fraud, identity theft,
              money laundering, or any other financial crime;
            </li>
            <li>
              Reverse engineer, decompile, disassemble, or attempt to derive the
              source code of the Service, except to the extent expressly
              permitted by applicable law;
            </li>
            <li>
              Scrape, crawl, or use automated means to access the Service or
              extract data from it;
            </li>
            <li>
              Circumvent, disable, or interfere with any security features of
              the Service;
            </li>
            <li>
              Use the Service to build a competing product or service;
            </li>
            <li>
              Interfere with or disrupt the Service, servers, or networks
              connected to the Service;
            </li>
            <li>Introduce viruses, malware, or other harmful code;</li>
            <li>
              Impersonate any person or entity, or misrepresent your affiliation
              with any person or entity;
            </li>
            <li>
              Use the Service in any manner that could damage, overburden, or
              impair the Service;
            </li>
            <li>
              Resell, sublicense, or redistribute access to the Service without
              our prior written consent;
            </li>
            <li>
              Use insights, data, or outputs from the Service to provide
              financial advisory services to third parties.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            6.3 Enforcement
          </h3>
          <p>
            We reserve the right to investigate and take appropriate action
            against any violation of these Terms, including suspending or
            terminating your account, removing content, and reporting violations
            to law enforcement authorities.
          </p>
        </section>

        {/* 7. Intellectual Property */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            7. Intellectual Property
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.1 Zurp&apos;s Intellectual Property
          </h3>
          <p>
            The Service, including its software, algorithms, insight engine,
            benefit catalogs, competitor maps, user interface, design, graphics,
            text, logos, and all other content and materials (collectively,
            &ldquo;zurp Content&rdquo;), is owned by or licensed to zurp, LLC
            and is protected by copyright, trademark, trade secret, and other
            intellectual property laws.
          </p>
          <p>
            Subject to your compliance with these Terms, we grant you a limited,
            non-exclusive, non-transferable, revocable license to access and use
            the Service for your personal, non-commercial purposes. This license
            does not include the right to:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Modify, copy, or create derivative works based on the Service or
              zurp Content;
            </li>
            <li>
              Use any data mining, robots, or similar data gathering or
              extraction methods;
            </li>
            <li>
              Download or cache any zurp Content except as expressly permitted;
            </li>
            <li>
              Use the zurp name, logo, or trademarks without our prior written
              consent.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.2 Your Content
          </h3>
          <p>
            You retain ownership of any content you submit to the Service (e.g.,
            support messages, feedback). By submitting content, you grant zurp a
            non-exclusive, royalty-free, worldwide license to use, reproduce,
            and display that content solely for the purpose of operating and
            improving the Service.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.3 Feedback
          </h3>
          <p>
            If you provide suggestions, ideas, or feedback about the Service
            (&ldquo;Feedback&rdquo;), you grant zurp an irrevocable,
            non-exclusive, royalty-free, perpetual, worldwide license to use,
            modify, and incorporate that Feedback into the Service without any
            obligation to you. You acknowledge that Feedback is not confidential
            and that zurp may already be developing similar ideas independently.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            7.4 DMCA and Copyright Complaints
          </h3>
          <p>
            If you believe that content on the Service infringes your copyright,
            please contact us at{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>{" "}
            with a notice that includes: identification of the copyrighted work,
            identification of the allegedly infringing material, your contact
            information, and a statement under penalty of perjury that the
            information is accurate and you are authorized to act on behalf of
            the copyright owner.
          </p>
        </section>

        {/* 8. Fees and Payment */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            8. Fees and Payment
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            8.1 Free Service
          </h3>
          <p>
            The Service is currently offered free of charge. We reserve the
            right to introduce paid features, subscription tiers, or other
            monetization in the future.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            8.2 Changes to Pricing
          </h3>
          <p>
            If we introduce fees for any portion of the Service that you
            currently use for free, we will provide at least 60 days&apos;
            advance notice. You will not be charged unless you affirmatively opt
            in to a paid plan. Features that were available to you for free at
            the time of any pricing change will remain available in a free tier,
            though new features may require a paid subscription.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            8.3 Third-Party Charges
          </h3>
          <p>
            Your use of the Service may require internet access and a compatible
            device, the costs of which are your responsibility. Your financial
            institution may impose fees related to account access; zurp is not
            responsible for any such fees.
          </p>
        </section>

        {/* 9. Disclaimers */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            9. Disclaimers
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.1 No Financial Advice
          </h3>
          <p className="font-semibold text-[var(--text-primary)] uppercase text-sm">
            The Service is provided for informational and analytical purposes
            only. Zurp is not a registered investment advisor, broker-dealer,
            financial planner, credit counselor, tax advisor, or insurance
            broker.
          </p>
          <p>
            Nothing in the Service constitutes financial, investment, tax, legal,
            or insurance advice. The insights, recommendations, comparisons, and
            calculations provided by the Service are based on automated analysis
            of your transaction data and publicly available credit card benefit
            information. They are not personalized financial advice and should
            not be the sole basis for any financial decision.
          </p>
          <p>
            Before making any financial decision &mdash; including switching
            credit cards, modifying your spending patterns, or filing benefit
            claims &mdash; you should consult with a qualified financial
            professional and review the official terms and conditions provided by
            your card issuer.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.2 Benefit Information Accuracy
          </h3>
          <p>
            Zurp&apos;s benefit catalogs are compiled from publicly available
            sources and are updated periodically. Credit card benefits, terms,
            fees, rewards rates, partner offers, and promotional programs are
            subject to change by card issuers at any time without notice to
            zurp.{" "}
            <strong className="text-[var(--text-primary)]">
              We do not guarantee that the benefit information displayed in the
              Service is current, complete, or accurate at all times.
            </strong>
          </p>
          <p>
            Your card&apos;s official cardmember agreement and benefits guide,
            as provided by your card issuer, are the authoritative source for
            your card&apos;s benefits. In the event of any discrepancy between
            information in zurp and information from your card issuer, your card
            issuer&apos;s terms control.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.3 Points and Value Calculations
          </h3>
          <p>
            When the Service displays point valuations, estimated dollar values,
            or &ldquo;value captured/missed&rdquo; calculations, these are
            estimates based on commonly referenced redemption rates (e.g., cents
            per point for transfer partner redemptions). Actual point values
            vary significantly depending on how you redeem them. Zurp&apos;s
            valuations are approximations and should not be relied upon as
            precise financial calculations.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            9.4 General Disclaimer
          </h3>
          <p className="font-semibold text-[var(--text-primary)] uppercase text-sm">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, either express or
            implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, title, and
            non-infringement.
          </p>
          <p>We do not warrant that:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              The Service will be uninterrupted, timely, secure, or error-free;
            </li>
            <li>
              The results obtained from the Service will be accurate or
              reliable;
            </li>
            <li>Any errors in the Service will be corrected;</li>
            <li>
              The Service will meet your specific requirements or expectations.
            </li>
          </ul>
          <p>Your use of the Service is at your sole risk.</p>
        </section>

        {/* 10. Limitation of Liability */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            10. Limitation of Liability
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            10.1 Exclusion of Certain Damages
          </h3>
          <p className="font-semibold text-[var(--text-primary)] uppercase text-sm">
            To the maximum extent permitted by applicable law, in no event shall
            zurp, its officers, directors, members, employees, agents, or
            licensors be liable for any indirect, incidental, special,
            consequential, punitive, or exemplary damages, including but not
            limited to:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Loss of profits, revenue, data, or business opportunities;
            </li>
            <li>Cost of procurement of substitute services;</li>
            <li>Loss of goodwill;</li>
            <li>
              Damages resulting from missed credit card benefits, unredeemed
              credits, expired rewards, or suboptimal spending decisions;
            </li>
            <li>
              Damages arising from inaccurate benefit information, incorrect
              point valuations, or erroneous insight recommendations;
            </li>
            <li>
              Damages arising from unauthorized access to or alteration of your
              data;
            </li>
            <li>
              Damages arising from interruption or cessation of the Service;
            </li>
          </ul>
          <p className="font-semibold text-[var(--text-primary)] uppercase text-sm">
            Whether based on warranty, contract, tort (including negligence),
            strict liability, or any other legal theory, and whether or not zurp
            has been advised of the possibility of such damages.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            10.2 Cap on Liability
          </h3>
          <p className="font-semibold text-[var(--text-primary)] text-sm">
            To the maximum extent permitted by applicable law, Zurp&apos;s total
            aggregate liability to you for all claims arising out of or relating
            to these Terms or the Service shall not exceed the greater of: (a)
            the amounts you have paid to zurp in the twelve (12) months
            immediately preceding the event giving rise to the claim, or (b) one
            hundred dollars ($100).
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            10.3 Basis of the Bargain
          </h3>
          <p>
            You acknowledge that the disclaimers and limitations of liability in
            Sections 9 and 10 reflect a fair and reasonable allocation of risk
            and form an essential basis of the bargain between you and zurp.
            Zurp would not provide the Service without these limitations.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            10.4 Jurisdictional Limitations
          </h3>
          <p>
            Some jurisdictions do not allow the exclusion or limitation of
            certain damages. In such jurisdictions, the limitations above shall
            apply to the maximum extent permitted by law.
          </p>
        </section>

        {/* 11. Indemnification */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            11. Indemnification
          </h2>
          <p>
            You agree to indemnify, defend, and hold harmless zurp, LLC and its
            officers, directors, members, employees, agents, and licensors from
            and against any and all claims, damages, losses, liabilities, costs,
            and expenses (including reasonable attorneys&apos; fees) arising out
            of or relating to:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>Your use of or inability to use the Service;</li>
            <li>Your violation of these Terms;</li>
            <li>Your violation of any applicable law or regulation;</li>
            <li>
              Your violation of any third party&apos;s rights, including
              intellectual property or privacy rights;
            </li>
            <li>Any content you submit to the Service;</li>
            <li>
              Your connection of financial accounts that you are not authorized
              to connect.
            </li>
          </ul>
          <p>
            We will provide you with prompt notice of any such claim and will
            reasonably cooperate with you in the defense of any such claim. We
            reserve the right, at our own expense, to assume the exclusive
            defense and control of any matter subject to indemnification by you.
          </p>
        </section>

        {/* 12. Account Termination */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            12. Account Termination
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            12.1 Termination by You
          </h3>
          <p>
            You may delete your account at any time through the app settings or
            by emailing{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>
            . Upon deletion:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Your Plaid connection will be disconnected, stopping all new data
              retrieval;
            </li>
            <li>
              Your personal data will be queued for deletion in accordance with
              our Privacy Policy (within 30 days, with encrypted backups purged
              within 90 days);
            </li>
            <li>
              Your access to the Service will be immediately revoked;
            </li>
            <li>
              Any insights, tracking history, and benefit calculations
              associated with your account will be deleted.
            </li>
          </ul>
          <p>
            Account deletion is permanent and cannot be undone. If you wish to
            use the Service again after deletion, you will need to create a new
            account and reconnect your financial accounts.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            12.2 Termination or Suspension by zurp
          </h3>
          <p>
            We may suspend or terminate your account and access to the Service
            at any time, with or without cause, and with or without notice, if:
          </p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>You violate these Terms or any applicable law;</li>
            <li>
              We reasonably believe your account has been compromised or is
              being used fraudulently;
            </li>
            <li>
              We are required to do so by law, regulation, or legal process;
            </li>
            <li>
              We discontinue the Service or any material portion of it;
            </li>
            <li>
              Your continued use poses a risk to the security, integrity, or
              availability of the Service or to other users.
            </li>
          </ul>
          <p>
            Where practicable, we will provide advance notice and an opportunity
            to export your data before termination. In cases of fraud, abuse, or
            legal compulsion, we may terminate without notice.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            12.3 Effect of Termination
          </h3>
          <p>Upon termination of your account for any reason:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              These Terms will terminate, except that Sections 7, 9, 10, 11, 13,
              14, and 15 will survive;
            </li>
            <li>You must cease all use of the Service;</li>
            <li>
              We will handle your data in accordance with our Privacy Policy.
            </li>
          </ul>
        </section>

        {/* 13. Dispute Resolution */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            13. Dispute Resolution
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            13.1 Informal Resolution
          </h3>
          <p>
            Before initiating any formal dispute resolution, you agree to first
            contact us at{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>{" "}
            and attempt to resolve the dispute informally for at least 30 days.
            Most concerns can be resolved this way.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            13.2 Binding Arbitration
          </h3>
          <p>
            If we cannot resolve a dispute informally,{" "}
            <strong className="text-[var(--text-primary)]">
              you and zurp agree to resolve any dispute, claim, or controversy
              arising out of or relating to these Terms or the Service through
              binding individual arbitration
            </strong>
            , administered by the American Arbitration Association
            (&ldquo;AAA&rdquo;) under its Consumer Arbitration Rules, rather
            than in court.
          </p>
          <p>
            The arbitration will be conducted in English, by a single
            arbitrator, and will take place in the state where you reside (or,
            at your election, remotely via video conference). The
            arbitrator&apos;s decision will be final and binding, and judgment on
            the arbitrator&apos;s award may be entered in any court of competent
            jurisdiction.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            13.3 Class Action Waiver
          </h3>
          <p className="font-semibold text-[var(--text-primary)] uppercase text-sm">
            You and zurp agree that each party may bring claims against the
            other only in your or its individual capacity, and not as a
            plaintiff or class member in any purported class, collective, or
            representative action.
          </p>
          <p>
            The arbitrator may not consolidate more than one person&apos;s
            claims and may not preside over any form of class or representative
            proceeding.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            13.4 Exceptions to Arbitration
          </h3>
          <p>Notwithstanding the above, either party may:</p>
          <ul className="ml-[var(--space-lg)] list-disc space-y-1">
            <li>
              Bring an individual action in small claims court for claims within
              the court&apos;s jurisdictional limits;
            </li>
            <li>
              Seek injunctive or other equitable relief in a court of competent
              jurisdiction to prevent the actual or threatened infringement,
              misappropriation, or violation of intellectual property rights or
              confidentiality obligations.
            </li>
          </ul>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            13.5 Opt-Out of Arbitration
          </h3>
          <p>
            You may opt out of the arbitration and class action waiver
            provisions by sending written notice to{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>{" "}
            within 30 days of first accepting these Terms. Your notice must
            include your full name, email address associated with your zurp
            account, and a clear statement that you wish to opt out of
            arbitration. If you opt out, any disputes will be resolved in the
            courts specified in Section 14.
          </p>
        </section>

        {/* 14. Governing Law */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            14. Governing Law and Jurisdiction
          </h2>
          <p>
            These Terms and any dispute arising from them shall be governed by
            and construed in accordance with the laws of the State of Delaware,
            without regard to its conflict of laws principles.
          </p>
          <p>
            If you have opted out of arbitration under Section 13.5, or if
            arbitration is found unenforceable, you agree to submit to the
            exclusive personal jurisdiction of the state and federal courts
            located in New Castle County, Delaware, for the resolution of any
            disputes.
          </p>
        </section>

        {/* 15. General Provisions */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            15. General Provisions
          </h2>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.1 Entire Agreement
          </h3>
          <p>
            These Terms, together with the Privacy Policy and any other policies
            or agreements referenced herein, constitute the entire agreement
            between you and zurp regarding the Service and supersede all prior
            agreements, understandings, and communications, whether written or
            oral.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.2 Severability
          </h3>
          <p>
            If any provision of these Terms is found to be invalid, illegal, or
            unenforceable by a court or arbitrator of competent jurisdiction,
            that provision shall be enforced to the maximum extent permissible,
            and the remaining provisions shall continue in full force and
            effect.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.3 Waiver
          </h3>
          <p>
            Our failure to enforce any right or provision of these Terms shall
            not be deemed a waiver of that right or provision. A waiver of any
            provision shall be effective only if made in writing and signed by
            zurp.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.4 Assignment
          </h3>
          <p>
            You may not assign or transfer these Terms or any rights or
            obligations hereunder without our prior written consent. Zurp may
            assign these Terms freely in connection with a merger, acquisition,
            reorganization, or sale of all or substantially all of its assets,
            provided the assignee agrees to be bound by these Terms.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.5 Force Majeure
          </h3>
          <p>
            Zurp shall not be liable for any delay or failure in performance
            resulting from causes beyond our reasonable control, including acts
            of God, natural disasters, pandemics, war, terrorism, labor
            disputes, government actions, power failures, internet disruptions,
            or failures of third-party services (including Plaid or financial
            institutions).
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.6 Notices
          </h3>
          <p>
            Notices to you may be sent to the email address associated with your
            account. Notices to zurp should be sent to{" "}
            <a
              href="mailto:support@zurp.com"
              className="text-[var(--accent)] hover:opacity-80"
            >
              support@zurp.com
            </a>
            . Notices are deemed received when sent by email (upon delivery
            confirmation) or, if sent by mail, three business days after deposit
            in the U.S. mail, postage prepaid, certified or registered, return
            receipt requested.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.7 No Third-Party Beneficiaries
          </h3>
          <p>
            These Terms do not create any third-party beneficiary rights in any
            person or entity, except as expressly provided herein.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.8 Headings
          </h3>
          <p>
            Section headings are for convenience only and shall not affect the
            interpretation of these Terms.
          </p>

          <h3 className="mt-[var(--space-md)] font-semibold text-[var(--text-primary)]">
            15.9 Relationship of the Parties
          </h3>
          <p>
            Nothing in these Terms shall be construed to create a partnership,
            joint venture, agency, or employment relationship between you and
            zurp. Neither party has the authority to bind the other.
          </p>
        </section>

        {/* 16. Contact */}
        <section>
          <h2 className="text-h3 font-semibold text-[var(--text-primary)]">
            16. Contact Information
          </h2>
          <p>
            If you have questions about these Terms, please contact us:
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">zurp, LLC</strong>
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
          These terms of service were last updated on February 9, 2026.
        </p>
      </article>
    </div>
  );
}
