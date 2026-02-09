**ZURP, LLC**

**Security Overview**

Last Updated: February 9, 2026

---

## 1. Our Security Commitment

Zurp is a credit card benefit optimization platform that processes sensitive financial data — your transaction history, account metadata, and spending patterns. We take this responsibility seriously. This document describes the security architecture, practices, and controls we implement to protect your data at every layer of the Service.

Our guiding principle is **minimal data, minimal access, maximal protection.** We collect only the data required to generate benefit insights. We grant access only to the personnel and systems that need it. And we encrypt, monitor, and audit everything in between.

---

## 2. Architecture Overview

### 2.1 Data Flow

Zurp's architecture is designed so that your most sensitive credentials never touch our systems:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Your Bank  │◄────►│    Plaid     │◄────►│    Zurp     │
│  (credentials│      │ (auth broker │      │ (read-only  │
│   stay here) │      │  + data pipe)│      │  analytics) │
└─────────────┘      └─────────────┘      └─────────────┘
```

1. **You authenticate with your bank through Plaid's interface.** Your bank login credentials are submitted directly to Plaid's servers via their encrypted SDK. Zurp's frontend, backend, and infrastructure never receive, process, transmit, or store your bank username or password.

2. **Plaid retrieves your financial data and transmits it to Zurp.** Plaid returns a tokenized access credential and your authorized data (transactions, account metadata, balances) to Zurp's backend over encrypted channels. The access token allows Zurp to request data refreshes from Plaid — it cannot be used to log in to your bank, initiate payments, or take any action on your accounts.

3. **Zurp processes the data and generates insights.** Transaction data is matched against benefit catalogs, competitor maps, and temporal rules to produce personalized insights. All processing happens server-side. Results are delivered to your browser over HTTPS.

### 2.2 Read-Only by Design

Zurp's integration with Plaid uses only read-only API products:

| Plaid Product | What It Does | What Zurp Uses It For |
|---|---|---|
| Transactions | Retrieves transaction history (up to 24 months) | Insight engine: benefit tracking, competitor detection, spending analysis |
| Accounts | Retrieves account metadata (name, type, institution, last four digits) | Card identification and display |
| Balance | Retrieves current balance and available credit | Contextual display only; not used for credit decisions |

**Products we do NOT use:** Auth (account/routing numbers), Transfer (money movement), Payment Initiation, Identity, Income, Liabilities, Investments, or any product that enables write access to your financial accounts. Zurp cannot move money, initiate payments, change account settings, or take any action on your behalf.

---

## 3. Encryption

### 3.1 In Transit

All data transmitted between any two components of the Zurp system is encrypted:

| Path | Protocol | Minimum Standard |
|---|---|---|
| Your browser ↔ Zurp servers | HTTPS (TLS) | TLS 1.2+; TLS 1.3 preferred |
| Your browser ↔ Plaid Link SDK | HTTPS (TLS) | TLS 1.2+ (Plaid-managed) |
| Zurp servers ↔ Plaid API | HTTPS (TLS) | TLS 1.2+ with certificate pinning |
| Zurp servers ↔ Database | TLS | TLS 1.2+ (provider-managed) |
| Zurp servers ↔ Cache layer | TLS | TLS 1.2+ |

We enforce HTTPS Strict Transport Security (HSTS) with a minimum max-age of one year, including subdomains. All HTTP requests are permanently redirected to HTTPS. We support only strong cipher suites and disable known-vulnerable protocols (SSLv3, TLS 1.0, TLS 1.1).

### 3.2 At Rest

All stored data is encrypted using AES-256 (Advanced Encryption Standard with 256-bit keys):

| Data Store | Encryption Method | Key Management |
|---|---|---|
| Primary database | AES-256 at rest | Cloud provider-managed keys (AWS KMS or equivalent) |
| Backups | AES-256 at rest | Separate encryption keys, rotated quarterly |
| Log storage | AES-256 at rest | Cloud provider-managed keys |
| Plaid access tokens | AES-256 application-layer encryption | Application-managed keys, stored in a secrets manager separate from the database |

Plaid access tokens receive an additional layer of application-level encryption before being written to the database, ensuring that even if the database storage encryption were compromised, the tokens would remain protected.

### 3.3 Key Management

- Encryption keys are managed through a dedicated secrets management service (e.g., AWS Secrets Manager, HashiCorp Vault, or equivalent).
- Database encryption keys are managed by the cloud provider's key management service and are never exposed to application code.
- Application-level encryption keys (e.g., for Plaid tokens) are stored in a secrets manager, separate from the database, with access restricted to the specific services that require them.
- Keys are rotated on a regular schedule (at minimum quarterly) and can be rotated immediately in the event of a suspected compromise.

---

## 4. Infrastructure Security

### 4.1 Hosting Environment

Zurp's infrastructure is hosted on SOC 2 Type II-certified cloud providers with:

- **Physical security:** Data centers with 24/7 security, biometric access controls, video surveillance, and multi-zone redundancy.
- **Network isolation:** Application servers, databases, and internal services are deployed in private subnets with no direct public internet access. Only load balancers and CDN edge nodes are publicly reachable.
- **Firewall rules:** Ingress and egress traffic is restricted by security groups and network ACLs following the principle of least privilege. Only required ports and protocols are open.
- **DDoS protection:** Automated DDoS detection and mitigation at the network edge, including rate limiting, traffic scrubbing, and geographic filtering when necessary.

### 4.2 Environment Separation

We maintain strictly separated environments:

| Environment | Purpose | Access to Production Data? |
|---|---|---|
| Production | Live Service serving real users | Yes (the only environment with real data) |
| Staging | Pre-deployment testing and QA | No — uses synthetic/anonymized data only |
| Development | Feature development and debugging | No — uses local mock data and Plaid sandbox |

Production credentials, secrets, and data are never used in non-production environments. Plaid's sandbox mode is used for all development and testing.

### 4.3 Dependency Management

- All third-party dependencies are pinned to specific versions and audited for known vulnerabilities using automated scanning tools.
- Critical and high-severity vulnerabilities are patched within 72 hours of disclosure; medium-severity within 14 days.
- We maintain a software bill of materials (SBOM) for all deployed services.
- Container images (if applicable) are built from minimal base images, scanned for vulnerabilities before deployment, and signed to ensure integrity.

---

## 5. Access Controls

### 5.1 Principle of Least Privilege

All access to Zurp's systems — by personnel, services, and automated processes — follows the principle of least privilege:

- **Personnel access:** Team members receive access only to the systems and data necessary for their role. Access is reviewed quarterly and revoked immediately upon role change or departure.
- **Service-to-service access:** Internal services authenticate to each other using short-lived tokens or mutual TLS, scoped to the minimum required permissions.
- **Database access:** Direct database access is restricted to a small number of authorized personnel for emergency operations only. All queries are routed through application services under normal operation.

### 5.2 Authentication

| System | Authentication Method |
|---|---|
| User accounts (Zurp app) | Email + password with bcrypt hashing (cost factor ≥ 12); optional MFA |
| Internal admin systems | SSO with mandatory multi-factor authentication (MFA) |
| Cloud infrastructure | IAM roles with MFA; no long-lived access keys |
| CI/CD pipeline | Service accounts with minimal permissions; secrets injected at runtime, never stored in code |
| Database | IAM-based authentication or short-lived credentials; no shared passwords |

### 5.3 Password Security

User passwords are:

- Hashed using bcrypt with a cost factor of 12 or higher (never stored in plaintext or reversible encryption);
- Subject to minimum length requirements (8+ characters);
- Checked against known breach databases (e.g., Have I Been Pwned) at registration and password change to prevent use of compromised passwords;
- Protected by rate limiting and account lockout on failed login attempts (see Section 7.2).

### 5.4 Multi-Factor Authentication

- **For users:** MFA is available and encouraged for all Zurp accounts. We support TOTP-based authenticator apps (e.g., Google Authenticator, Authy).
- **For personnel:** MFA is mandatory for all internal systems, cloud infrastructure, and administrative tools. Hardware security keys are required for infrastructure access.

---

## 6. Application Security

### 6.1 Secure Development Lifecycle

Security is integrated into every stage of development:

- **Design review:** New features that handle user data or modify the data flow undergo a security design review before development begins.
- **Code review:** All code changes require peer review with a security-aware reviewer. Changes to authentication, authorization, data handling, or Plaid integration require review by a senior engineer or security lead.
- **Automated testing:** Our CI/CD pipeline includes static application security testing (SAST), dependency vulnerability scanning, and linting for common security anti-patterns.
- **Pre-deployment checks:** Security-critical changes are reviewed in staging before production deployment.

### 6.2 OWASP Top 10 Protections

We implement controls against the OWASP Top 10 web application security risks:

| Risk | Mitigation |
|---|---|
| Injection (SQL, NoSQL, command) | Parameterized queries; input validation; ORM usage; no raw query construction |
| Broken authentication | Bcrypt password hashing; rate limiting; session management; MFA support |
| Sensitive data exposure | AES-256 encryption at rest; TLS in transit; no storage of bank credentials |
| XML External Entities (XXE) | Disabled XML external entity processing; JSON-only APIs |
| Broken access control | Role-based access control; server-side authorization checks on every request |
| Security misconfiguration | Automated configuration scanning; hardened defaults; no default credentials |
| Cross-Site Scripting (XSS) | Content Security Policy (CSP) headers; output encoding; React's built-in XSS protection |
| Insecure deserialization | No deserialization of untrusted data; strict input schemas |
| Vulnerable components | Automated dependency scanning; pinned versions; rapid patching |
| Insufficient logging | Comprehensive audit logging; centralized log management; anomaly detection |

### 6.3 API Security

- All API endpoints require authentication (JWT or session tokens).
- API rate limiting is enforced per-user and per-IP to prevent abuse and brute-force attacks.
- Input validation is performed on all API parameters using strict schemas.
- CORS (Cross-Origin Resource Sharing) is configured to allow only authorized origins.
- API responses never include more data than the requesting user is authorized to see.

### 6.4 Content Security Policy

We deploy a strict Content Security Policy (CSP) that:

- Restricts script execution to our own domains (no inline scripts; nonces for necessary cases);
- Blocks loading of resources from unauthorized third-party domains;
- Prevents framing of the application (X-Frame-Options: DENY);
- Disables plugins and other potentially dangerous browser features.

---

## 7. Monitoring, Logging, and Incident Response

### 7.1 Monitoring

- **Real-time monitoring:** Application health, error rates, latency, and resource utilization are monitored continuously with automated alerting.
- **Security monitoring:** Anomalous authentication patterns (e.g., brute-force attempts, login from unusual locations), unusual data access patterns, and infrastructure changes are monitored and flagged.
- **Uptime monitoring:** External uptime checks run at regular intervals to detect and alert on service outages.

### 7.2 Abuse Prevention

- **Rate limiting:** Login attempts, API calls, and Plaid connection requests are rate-limited per user, per IP, and globally.
- **Account lockout:** After a configurable number of failed login attempts (default: 10), the account is temporarily locked and the user is notified by email.
- **Bot detection:** Automated traffic analysis to identify and block bot-driven abuse, credential stuffing, and scraping.
- **IP reputation:** Known malicious IPs and Tor exit nodes may be subject to additional verification or blocking when accessing sensitive endpoints.

### 7.3 Audit Logging

We maintain detailed audit logs for security-relevant events, including:

- User authentication events (login, logout, failed attempts, password changes, MFA enrollment);
- Plaid account connections and disconnections;
- Data access events (transaction data retrieval, insight generation);
- Administrative actions (configuration changes, deployment events, access grants/revocations);
- Data deletion and export requests.

Audit logs are:

- Written to append-only storage to prevent tampering;
- Retained for a minimum of 12 months;
- Accessible only to authorized security and engineering personnel;
- Excluded from containing raw financial data (logs reference transaction IDs, not transaction details).

### 7.4 Incident Response Plan

Zurp maintains a documented incident response plan covering:

1. **Detection:** Automated alerting on anomalous patterns; manual reporting channels for team members and users.
2. **Triage:** Classification of incident severity (Critical, High, Medium, Low) based on data exposure scope, number of affected users, and ongoing vs. contained status.
3. **Containment:** Immediate steps to stop ongoing data loss or unauthorized access, including credential rotation, access revocation, and service isolation if necessary.
4. **Eradication:** Identification and removal of the root cause (e.g., patching a vulnerability, revoking compromised credentials, rolling back a malicious deployment).
5. **Recovery:** Restoration of affected services and data from known-good backups; verification of system integrity before resuming normal operations.
6. **Notification:** Users affected by a confirmed data breach will be notified in accordance with applicable law (see Section 7.5). Relevant regulatory authorities will be notified as required.
7. **Post-incident review:** Every security incident is followed by a blameless post-mortem that documents what happened, why, and what changes will prevent recurrence.

### 7.5 Breach Notification

In the event of a confirmed security breach involving your personal information:

- **Timing:** We will notify affected users as soon as practicable and no later than required by applicable law (e.g., 72 hours under GDPR, "expedient" under most U.S. state laws, within the specific timeframes required under CCPA and other state breach notification statutes).
- **Content:** Notification will include a description of the incident, the categories of data involved, the likely consequences, the measures taken to address the breach, and contact information for questions.
- **Method:** Notification will be provided by email to the address associated with your account. If email is unavailable or insufficient under applicable law, we will use alternative methods such as prominent website notice or postal mail.
- **Authorities:** We will notify relevant regulatory authorities (e.g., state attorneys general, CNIL, ICO) as required by applicable law.

---

## 8. Plaid Security

Because Plaid is a critical component of Zurp's data pipeline, its security posture directly affects yours. Here is a summary of Plaid's security practices:

| Control | Detail |
|---|---|
| Certification | SOC 2 Type II audited |
| Encryption in transit | TLS 1.2+ for all connections |
| Encryption at rest | AES-256 for all stored data |
| Credential handling | Bank credentials processed in Plaid's secure environment; never exposed to Zurp |
| Data minimization | Zurp receives only the data categories it requests (transactions, accounts, balances) |
| User control | Users can view and manage all Plaid connections at my.plaid.com |
| Regulatory compliance | Compliant with applicable financial regulations; regulated by relevant authorities in operating jurisdictions |
| Security audits | Regular independent third-party security audits and penetration testing |

For complete details on Plaid's security and privacy practices, visit: [plaid.com/safety](https://plaid.com/safety) and [plaid.com/legal](https://plaid.com/legal).

If you disconnect your bank account from Zurp, we immediately invalidate the associated Plaid access token. You can also revoke Plaid's access to your bank directly through my.plaid.com or by contacting Plaid's support.

---

## 9. Data Handling Practices

### 9.1 Data Minimization

We collect and retain only the data necessary to provide the Service:

- **We collect:** Transaction data (merchant, amount, date, category), account metadata (name, type, last four digits, institution), and balance information.
- **We do NOT collect:** Full card numbers, CVVs, PINs, bank login credentials, Social Security numbers, tax identification numbers, or data from non-credit-card accounts unless explicitly connected by you.
- **We do NOT store:** Raw Plaid API responses beyond the specific fields we need. Extraneous data returned by Plaid is discarded at the application layer before persistence.

### 9.2 Data Isolation

- Each user's data is logically isolated. Application-layer access controls ensure that no user can access another user's transactions, insights, or account information.
- Internal services access user data only through authenticated, authorized API calls — never through direct database queries under normal operation.
- Analytical and aggregated data used for Service improvement is fully anonymized and cannot be traced back to individual users.

### 9.3 Data Deletion

When you delete your account:

1. Your Plaid access token is immediately invalidated, stopping all data retrieval.
2. Your personal data (account info, transaction history, insights, tracking data) is queued for deletion within 30 days.
3. Encrypted backups containing your data are purged within 90 days.
4. Anonymized, aggregated data that cannot identify you may be retained indefinitely for statistical purposes.

You may also request deletion of data that Plaid holds about you separately through my.plaid.com or by contacting Plaid directly.

### 9.4 Backup and Recovery

- Automated encrypted backups are performed daily.
- Backups are stored in a geographically separate region from the primary database for disaster recovery.
- Backup restoration is tested periodically to ensure recoverability.
- Backups are encrypted with keys separate from the primary database encryption keys.

---

## 10. Vendor and Third-Party Security

### 10.1 Vendor Assessment

Before engaging any third-party service provider that processes user data, we evaluate:

- Their security certifications (SOC 2, ISO 27001, or equivalent);
- Their encryption practices (at rest and in transit);
- Their access control and authentication mechanisms;
- Their incident response and breach notification procedures;
- Their data retention and deletion capabilities;
- Applicable regulatory compliance.

### 10.2 Contractual Protections

All service providers that process user data are bound by data processing agreements (DPAs) that require:

- Processing data only for the specified purposes and on our instructions;
- Implementing appropriate technical and organizational security measures;
- Notifying Zurp promptly of any security incident or data breach;
- Returning or deleting data upon termination of the engagement;
- Cooperating with security audits and compliance assessments upon request.

### 10.3 Ongoing Monitoring

Vendor security posture is reviewed at least annually, or more frequently if the vendor processes sensitive financial data or experiences a security incident.

---

## 11. Compliance

### 11.1 Regulatory Framework

Zurp's security and privacy practices are designed to comply with:

| Regulation | Applicability |
|---|---|
| CCPA / CPRA (California) | California resident data; consumer rights, data handling disclosures |
| GDPR (EU/EEA/UK) | EEA/UK user data; lawful basis, data subject rights, cross-border transfers |
| State privacy laws (CO, CT, VA, TX, OR, MT, etc.) | Residents of states with comprehensive privacy legislation |
| GLBA (Gramm-Leach-Bliley Act) | Financial data handling, if applicable to Zurp's classification |
| PCI DSS awareness | Not directly applicable (Zurp does not process, store, or transmit card numbers), but security practices are informed by PCI DSS principles |
| SOC 2 principles | Trust Services Criteria (Security, Availability, Confidentiality, Processing Integrity, Privacy) guide our control framework |

### 11.2 PCI DSS Scope

**Zurp is not in scope for PCI DSS compliance** because we do not process, store, or transmit cardholder data (full card numbers, CVVs, or PINs). Your card number is never entered into or handled by the Zurp application. Account connections are managed exclusively through Plaid, which handles all credential exchange with your financial institution. We receive only transaction-level data (merchant names, amounts, dates) and account metadata (last four digits, account type) — none of which constitute cardholder data under PCI DSS definitions.

That said, our security controls are informed by PCI DSS principles and exceed the baseline requirements for our data classification level.

---

## 12. User Security Recommendations

To maximize the security of your Zurp account and connected financial data, we recommend:

- **Use a unique, strong password** for your Zurp account that you do not reuse on other services. Consider using a password manager.
- **Enable multi-factor authentication (MFA)** on your Zurp account when available.
- **Enable MFA on your bank accounts** as well — this protects the Plaid connection at the source.
- **Review your Plaid connections** periodically at my.plaid.com. Disconnect any apps you no longer use.
- **Keep your devices and browsers updated** with the latest security patches.
- **Be cautious of phishing.** Zurp will never ask for your bank password by email, text, phone, or within the Zurp app. If you receive a suspicious communication claiming to be from Zurp, contact us at security@zurp.com.
- **Report suspicious activity** on your Zurp account immediately to security@zurp.com.

---

## 13. Responsible Disclosure

We welcome security researchers who help us keep the Service safe. If you discover a security vulnerability in Zurp:

- **Email:** security@zurp.com
- **Subject line:** "Security Vulnerability Report"
- **Please include:** A description of the vulnerability, steps to reproduce, potential impact, and any supporting evidence (screenshots, logs, proof-of-concept).

### Our Commitments

- We will acknowledge receipt of your report within 48 hours.
- We will investigate and provide an initial assessment within 7 business days.
- We will keep you informed of our progress toward a fix.
- We will not take legal action against researchers who act in good faith, follow responsible disclosure practices, and do not access or modify other users' data.
- We will credit you (with your permission) when we publish a fix.

### Guidelines

- Do not access, modify, or delete data belonging to other users.
- Do not disrupt the availability of the Service (no denial-of-service testing).
- Do not publicly disclose the vulnerability until we have had a reasonable opportunity to address it (minimum 90 days from report or until a fix is deployed, whichever is sooner).
- Do not use automated vulnerability scanners against production systems without prior coordination.

---

## 14. Contact

For security-related questions, concerns, or reports:

**Zurp, LLC**
Security Team: security@zurp.com
Privacy Team: privacy@zurp.com
General Support: support@zurp.com

---

*— End of Security Overview —*
