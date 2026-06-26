# ============================================================
# Add legal pages script (Windows PowerShell 5.1 safe)
#
# Writes the Privacy Policy and Terms of Use pages at the routes
# already linked from the site Footer:
#   src/app/privacy/page.tsx  ->  /privacy
#   src/app/terms/page.tsx    ->  /terms
#
# Both pages use the existing navy-hero + content-section visual
# pattern (matching About/Programs/Opportunities pages) and embed
# the legal text via a JS template literal rendered through
# dangerouslySetInnerHTML, since the content is static and
# trusted (written by us, not user input).
#
# All content is fully ASCII - verified before this script was
# generated - so this is immune to the PowerShell 5.1 multi-byte
# encoding bug encountered earlier with other files.
#
# Run this from your project ROOT (where package.json lives):
#   .\add-legal-pages.ps1
# ============================================================

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$privacyContent = @'
/**
 * Privacy Policy Page - /privacy
 * @module app/privacy/page
 */
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read Youth Access Hub's Privacy Policy to understand how we collect, use, and protect your personal information.",
};

const PRIVACY_POLICY_HTML = `<h1>Privacy Policy</h1>
<p>Last updated: June 26, 2026</p>
<p>This Privacy Policy describes how Youth Access Hub collects, uses, and discloses information when you use our website, and explains your rights regarding that information under Zimbabwean law.</p>
<p>By using our website, you agree to the collection and use of information in accordance with this Privacy Policy.</p>

<h2>Interpretation and Definitions</h2>
<h3>Interpretation</h3>
<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
<h3>Definitions</h3>
<p>For the purposes of this Privacy Policy:</p>
<ul>
<li><p><strong>YAH</strong> (referred to as "we", "us", or "our") refers to Youth Access Hub, a youth development organisation based in Harare, Zimbabwe.</p></li>
<li><p><strong>Website</strong> refers to the Youth Access Hub website, accessible from <a href="https://www.youthaccesshub.org" rel="external nofollow noopener" target="_blank">www.youthaccesshub.org</a>.</p></li>
<li><p><strong>Executive Account</strong> means the login credentials issued to authorised YAH staff to manage programs, opportunities, and partner content through the admin dashboard. The public cannot create accounts on this website.</p></li>
<li><p><strong>Personal Data</strong> (or "Personal Information") means any information that relates to an identified or identifiable individual, as defined under Zimbabwe's Cyber and Data Protection Act [Chapter 12:07].</p></li>
<li><p><strong>Data Controller</strong> means the entity that determines the purposes and means of processing Personal Data. For this website, the Data Controller is Youth Access Hub.</p></li>
<li><p><strong>Service Provider</strong> means a third party that processes data on our behalf to operate this website. Currently this is Supabase, Inc., which provides our database, authentication, and file storage infrastructure.</p></li>
<li><p><strong>You</strong> means the individual visiting or using the Website.</p></li>
</ul>

<h2>Our Legal Basis</h2>
<p>Youth Access Hub processes Personal Data in accordance with Zimbabwe's <strong>Cyber and Data Protection Act [Chapter 12:07]</strong>. The Postal and Telecommunications Regulatory Authority of Zimbabwe (<strong>POTRAZ</strong>) acts as the Data Protection Authority responsible for overseeing compliance with this Act.</p>
<p>Under the Act, you have the right to:</p>
<ul>
<li>be informed of how your Personal Data is used;</li>
<li>access the Personal Data we hold about you;</li>
<li>object to the processing of your Personal Data;</li>
<li>request correction of false or misleading Personal Data; and</li>
<li>request deletion of your Personal Data, subject to our legal retention obligations.</li>
</ul>
<p>To exercise any of these rights, contact us using the details at the end of this policy.</p>

<h2>Collecting and Using Your Personal Data</h2>
<h3>What we actually collect</h3>
<p>Unlike many websites, the public-facing Youth Access Hub website does not allow visitors to create accounts, make purchases, or post content. The only way the public site currently collects Personal Data is through the <strong>Contact form</strong>.</p>
<h4>Contact Form Data</h4>
<p>When you submit our contact form, we collect:</p>
<ul>
<li>Your name</li>
<li>Your email address</li>
<li>The message you send us, and which reason you selected (e.g. general enquiry, mentorship interest, partnership enquiry)</li>
</ul>
<p>This information is used solely to respond to your enquiry and, where relevant, to connect you with the appropriate program, opportunity, mentor, or partner organisation within our network.</p>
<h4>Executive Account Data</h4>
<p>YAH staff who manage website content log in through a separate, password-protected admin area. Their account email and login activity (including failed login attempts, for security purposes) are stored to operate and secure that admin system. This does not apply to members of the public, who cannot register for an account on this website.</p>
<h4>Usage Data</h4>
<p>Like most websites, our hosting infrastructure (Vercel) automatically records basic technical information when you visit, such as your IP address, browser type, and the pages you visit, for the purpose of operating and securing the website. We do not currently use any third-party analytics or advertising tracking tools (such as Google Analytics or Meta Pixel) on this website. If this changes in the future, we will update this Privacy Policy accordingly.</p>

<h3>Cookies</h3>
<p>The public-facing website does not set any cookies for tracking, advertising, or analytics purposes.</p>
<p>The only cookie used anywhere on this domain is a <strong>necessary session cookie</strong> set when a YAH executive logs into the admin dashboard, which keeps them securely signed in. This cookie is essential to the operation of the admin system, contains no information about members of the public, and is not used for tracking. Because it is strictly necessary for a login function that only YAH staff use, no cookie consent banner is shown to the public.</p>

<h3>How We Use Your Personal Data</h3>
<p>We use the Personal Data you provide through the contact form to:</p>
<ul>
<li><strong>Respond to your enquiry</strong> - to read, understand, and reply to your message;</li>
<li><strong>Connect you with our network</strong> - for example, referring you to a mentorship program, opportunity, or partner organisation relevant to your enquiry;</li>
<li><strong>Maintain records</strong> - to keep a reasonable record of enquiries for organisational and reporting purposes; and</li>
<li><strong>Comply with legal obligations</strong> - where required by Zimbabwean law.</li>
</ul>
<p>We do not sell your Personal Data, and we do not use it for advertising or marketing profiling.</p>

<h3>Who We Share Your Personal Data With</h3>
<ul>
<li><strong>Service Providers:</strong> Your data is stored using Supabase (database, authentication, and file storage) and our website is hosted on Vercel. These providers process data on our behalf under their own security and data processing terms, and do not use your data for their own purposes.</li>
<li><strong>Partner organisations:</strong> If your enquiry relates to a specific program, opportunity, mentorship, or partnership, we may share relevant details from your message with the partner organisation or mentor concerned, so they can respond to you directly. We will only do this where it is reasonably necessary to address your enquiry.</li>
<li><strong>Legal and safety reasons:</strong> We may disclose your Personal Data if required by Zimbabwean law, in response to a valid request from a court or government authority, or where necessary to protect the rights, property, or safety of YAH, our partners, or the public.</li>
</ul>
<p>We do not share your Personal Data with advertisers, data brokers, or unrelated third parties.</p>

<h3>International Data Storage</h3>
<p>Our website infrastructure (Supabase and Vercel) may store and process data on servers located outside Zimbabwe. Where this occurs, we take reasonable steps to ensure your Personal Data continues to receive an adequate standard of protection, consistent with the requirements of Zimbabwe's Cyber and Data Protection Act regarding the transfer of personal information outside Zimbabwe.</p>

<h3>Retention of Your Personal Data</h3>
<p>We retain Personal Data only for as long as reasonably necessary for the purpose it was collected:</p>
<ul>
<li><strong>Contact form submissions:</strong> retained for up to 24 months from the date of your enquiry, to allow for follow-up and reasonable record-keeping, unless you ask us to delete it sooner.</li>
<li><strong>Executive account and login security records:</strong> retained for the duration of the staff member's role with YAH, plus a reasonable period afterward for security and audit purposes.</li>
<li><strong>Technical/server logs:</strong> retained for up to 12 months for security and troubleshooting purposes.</li>
</ul>
<p>We may retain data longer where required by Zimbabwean law, or where necessary to resolve a dispute or enforce our policies. You may contact us at any time to ask how long we are holding your specific data, or to request its deletion.</p>

<h3>Your Right to Access, Correct, or Delete Your Data</h3>
<p>You can contact us at any time to:</p>
<ul>
<li>ask what Personal Data we hold about you;</li>
<li>ask us to correct inaccurate information; or</li>
<li>ask us to delete your Personal Data.</li>
</ul>
<p>We will respond to your request within a reasonable time. We may need to retain certain information where we have a legal obligation to do so, in which case we will explain why.</p>

<h3>Security of Your Personal Data</h3>
<p>We take reasonable technical and organisational measures to protect your Personal Data, consistent with the security obligations under Zimbabwe's Cyber and Data Protection Act. These include access controls on our admin systems, encrypted data storage through our infrastructure providers, and login protections such as lockout after repeated failed login attempts on our admin system.</p>
<p>However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
<p>In the event of a data breach that affects your Personal Data, we will notify the relevant authorities and affected individuals in accordance with the timeframes required under Zimbabwean law.</p>

<h2>Children's Privacy</h2>
<p>Youth Access Hub's mission is to serve young people, including secondary school-aged youth. Our Service is intended for use by individuals aged <strong>13 and older</strong>. We do not knowingly collect Personal Data through the public website from children under 13 without the involvement of a parent, guardian, teacher, or YAH access point coordinator.</p>
<p>If you are a parent or guardian and believe your child under 13 has submitted Personal Data to us directly through the website, please contact us so we can review and, where appropriate, delete that information.</p>
<p>Where a young person registers for a YAH program or opportunity in person, through a school, or through a community access point (rather than through this website), that registration is governed by YAH's program-specific consent and intake procedures, not by this website's Privacy Policy.</p>

<h2>Links to Other Websites</h2>
<p>Our website may contain links to the websites of our partner organisations or other third parties. If you click on a third-party link, you will be directed to that organisation's own website. We are not responsible for the content or privacy practices of any third-party website, and we encourage you to review their privacy policy before providing any Personal Data to them.</p>

<h2>Changes to this Privacy Policy</h2>
<p>We may update this Privacy Policy from time to time, for example as our website's functionality changes. We will post any changes on this page and update the "Last updated" date above. We encourage you to review this page periodically.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, or wish to exercise any of your rights regarding your Personal Data, you can contact us:</p>
<ul>
<li>By email: <a href="mailto:info@youthaccesshub.org">info@youthaccesshub.org</a></li>
</ul>

<p style="margin-top:2rem; padding:1rem; border:1px solid #ddd; border-radius:8px; font-size:0.875rem; color:#555;">
<strong>Note:</strong> This Privacy Policy has been prepared to reflect Youth Access Hub's actual data practices and the requirements of Zimbabwe's Cyber and Data Protection Act [Chapter 12:07] to the best of our understanding. It has not yet been reviewed by a qualified legal practitioner. We recommend obtaining legal review, and confirming Youth Access Hub's data controller registration status with POTRAZ, before relying on this document as a complete statement of legal compliance.
</p>
`;

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Header */}
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-16 md:py-20">
          <SectionHeading
            eyebrow="Legal"
            title="Privacy Policy"
            subtitle="How Youth Access Hub collects, uses, and protects your personal information."
            color="light"
            decorativeBar
            accent="teal"
          />
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg
            viewBox="0 0 1440 50"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-8 md:h-12"
            style={{ display: "block", fill: "var(--yah-white)" }}
          >
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section style={{ backgroundColor: "var(--yah-white)" }}>
        <div className="container-yah py-14 md:py-20">
          <div
            className="legal-content max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_HTML }}
          />
        </div>
      </section>

      <style>{`
        .legal-content h1 {
          font-family: var(--font-heading);
          color: var(--yah-navy);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .legal-content h2 {
          font-family: var(--font-heading);
          color: var(--yah-navy);
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--yah-light-gray);
        }
        .legal-content h3 {
          font-family: var(--font-heading);
          color: var(--yah-navy);
          font-size: 1.0625rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .legal-content h4 {
          font-family: var(--font-heading);
          color: var(--yah-navy);
          font-size: 0.9375rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .legal-content p {
          color: var(--yah-slate);
          font-size: 0.9375rem;
          line-height: 1.7;
          margin-bottom: 0.875rem;
        }
        .legal-content ul {
          margin: 0 0 1rem 0;
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .legal-content li {
          color: var(--yah-slate);
          font-size: 0.9375rem;
          line-height: 1.6;
        }
        .legal-content strong {
          color: var(--yah-navy);
          font-weight: 600;
        }
        .legal-content a {
          color: var(--yah-teal);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .legal-content a:hover {
          color: var(--yah-navy);
        }
      `}</style>
    </>
  );
}

'@

$termsContent = @'
/**
 * Terms of Use Page - /terms
 * @module app/terms/page
 */
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Read the Terms of Use governing your access to and use of the Youth Access Hub website.",
};

const TERMS_OF_USE_HTML = `<h1>Terms of Use</h1>
<p>Last updated: June 26, 2026</p>
<p>These Terms of Use ("Terms") govern your access to and use of the Youth Access Hub website, accessible from <a href="https://www.youthaccesshub.org" rel="external nofollow noopener" target="_blank">www.youthaccesshub.org</a> (the "Website"). By accessing or using the Website, you agree to be bound by these Terms. If you do not agree, please do not use the Website.</p>

<h2>Interpretation and Definitions</h2>
<ul>
<li><p><strong>YAH</strong> (referred to as "we", "us", or "our") refers to Youth Access Hub, a youth development organisation based in Harare, Zimbabwe.</p></li>
<li><p><strong>Website</strong> means the Youth Access Hub website and all content, features, and functionality made available on it.</p></li>
<li><p><strong>Partner Organisation</strong> means a school, university, corporate, NGO, government body, or other third party that provides programs, opportunities, mentorship, or other services referenced on the Website.</p></li>
<li><p><strong>Program / Opportunity</strong> means any mentorship program, internship, training, funding, volunteering, or other initiative listed on the Website, whether run directly by YAH or by a Partner Organisation.</p></li>
<li><p><strong>You</strong> means any person who accesses or uses the Website.</p></li>
</ul>

<h2>Who This Website Is For</h2>
<p>The Youth Access Hub website is an informational platform. It allows visitors to:</p>
<ul>
<li>Browse mentorship programs, opportunities, and partner organisations;</li>
<li>Learn about YAH's mission and activities; and</li>
<li>Submit enquiries through our contact form, including to register interest in a program, opportunity, mentorship, or partnership.</li>
</ul>
<p>The public cannot create an account on this Website. A separate, password-protected admin area exists for authorised YAH executive staff only, to manage the content shown on the public Website. Use of that admin area is governed by internal YAH policies, not by these public-facing Terms.</p>

<h2>YAH's Role as a Connector</h2>
<p>Youth Access Hub acts primarily as an <strong>intermediary and connector</strong> between young people and our network of mentors, employers, training providers, funders, and Partner Organisations. In most cases:</p>
<ul>
<li>Programs and opportunities listed on the Website are <strong>delivered, funded, or provided by Partner Organisations</strong>, not directly by YAH;</li>
<li>YAH coordinates referrals, onboarding, and matching, but does not control the day-to-day conduct, content, safety practices, or outcomes of a Partner Organisation's program; and</li>
<li>Where a mentor, employer, or Partner Organisation is involved, that party is responsible for their own conduct and for the program or opportunity they provide.</li>
</ul>
<p><strong>To the fullest extent permitted by Zimbabwean law, YAH is not liable for the acts, omissions, conduct, program quality, or outcomes of any Partner Organisation, mentor, or third party that you are referred to or connected with through this Website.</strong> Where you have a concern about a specific program, opportunity, or partner, please contact us so we can look into it, but any contractual or other relationship with that program is between you and the relevant Partner Organisation.</p>

<h2>Accuracy of Information</h2>
<p>We make reasonable efforts to keep program, opportunity, and partner listings on the Website accurate and up to date. However:</p>
<ul>
<li>Programs and opportunities may close, change, or become unavailable without notice, including after you have viewed them on the Website;</li>
<li>Deadlines, eligibility criteria, and details are set by the relevant Partner Organisation and may change; and</li>
<li>We do not guarantee that any program or opportunity will be available, suitable for you, or lead to any particular outcome.</li>
</ul>
<p>You should independently verify important details (such as deadlines) directly with the relevant Partner Organisation where possible.</p>

<h2>Acceptable Use</h2>
<p>When using the Website, you agree not to:</p>
<ul>
<li>Submit false, misleading, or fraudulent information through the contact form or any other feature of the Website;</li>
<li>Attempt to gain unauthorised access to the admin area, our databases, or any part of the Website not intended for public access;</li>
<li>Use any automated system (bot, scraper, etc.) to extract data from the Website at a scale or frequency that could disrupt its normal operation;</li>
<li>Use the Website to transmit harmful code, or to harass, impersonate, or harm any other person, mentor, or Partner Organisation; or</li>
<li>Use the Website in any way that violates applicable Zimbabwean law.</li>
</ul>
<p>We may restrict or block access to the Website for anyone who violates these Terms.</p>

<h2>Intellectual Property</h2>
<p>The Website's design, text, graphics, logo, and original content are the property of Youth Access Hub, except where otherwise indicated. Partner Organisation logos and names remain the property of those organisations and are used with their permission to indicate partnership.</p>
<p>You may view and share content from the Website for personal, non-commercial purposes (for example, sharing a link to a program with a friend). You may not reproduce, redistribute, or use YAH's content for commercial purposes without our prior written permission.</p>

<h2>Third-Party Links</h2>
<p>The Website may link to the websites of Partner Organisations or other third parties (for example, an "Apply Now" link to an external application form). We do not control and are not responsible for the content, terms, or privacy practices of any third-party website. Visiting a third-party website is at your own risk and subject to that website's own terms.</p>

<h2>No Warranty</h2>
<p>The Website and its content are provided "as is" and "as available", without warranties of any kind, whether express or implied, including but not limited to warranties of accuracy, completeness, availability, or fitness for a particular purpose, to the fullest extent permitted by Zimbabwean law.</p>

<h2>Limitation of Liability</h2>
<p>To the fullest extent permitted by Zimbabwean law, Youth Access Hub, its staff, and its directors shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the Website, or from your participation in any program, opportunity, or interaction with a Partner Organisation, mentor, or other third party referenced on the Website.</p>
<p>Nothing in these Terms is intended to exclude or limit any liability that cannot lawfully be excluded or limited under Zimbabwean law.</p>

<h2>Children and Young People</h2>
<p>Youth Access Hub's mission is to serve young people, including secondary school-aged youth. If you are under the age of 18, we encourage you to involve a parent, guardian, teacher, or trusted adult when registering interest in a program or opportunity, and to review our <a href="/privacy">Privacy Policy</a> for how we handle information from young people. Where a program or opportunity has its own age or consent requirements, those requirements are set by the relevant Partner Organisation.</p>

<h2>Changes to the Website and These Terms</h2>
<p>We may update, suspend, or discontinue any part of the Website, and may revise these Terms, at any time. Where we make material changes to these Terms, we will update the "Last updated" date above. Continued use of the Website after changes are posted constitutes your acceptance of the revised Terms.</p>

<h2>Governing Law</h2>
<p>These Terms are governed by the laws of Zimbabwe, without regard to conflict of law principles. Any dispute arising from these Terms or your use of the Website shall be subject to the exclusive jurisdiction of the courts of Zimbabwe.</p>

<h2>Severability</h2>
<p>If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.</p>

<h2>Contact Us</h2>
<p>If you have any questions about these Terms, you can contact us:</p>
<ul>
<li>By email: <a href="mailto:info@youthaccesshub.org">info@youthaccesshub.org</a></li>
</ul>

<p style="margin-top:2rem; padding:1rem; border:1px solid #ddd; border-radius:8px; font-size:0.875rem; color:#555;">
<strong>Note:</strong> These Terms of Use have been prepared to reflect Youth Access Hub's actual website functionality and general principles of Zimbabwean law to the best of our understanding. They have not yet been reviewed by a qualified legal practitioner. We recommend obtaining legal review before relying on this document as a complete statement of YAH's legal position, particularly regarding liability and the Partner Organisation disclaimer above.
</p>
`;

export default function TermsOfUsePage() {
  return (
    <>
      {/* Header */}
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-16 md:py-20">
          <SectionHeading
            eyebrow="Legal"
            title="Terms of Use"
            subtitle="The terms that govern your use of the Youth Access Hub website."
            color="light"
            decorativeBar
            accent="orange"
          />
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg
            viewBox="0 0 1440 50"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-8 md:h-12"
            style={{ display: "block", fill: "var(--yah-white)" }}
          >
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section style={{ backgroundColor: "var(--yah-white)" }}>
        <div className="container-yah py-14 md:py-20">
          <div
            className="legal-content max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: TERMS_OF_USE_HTML }}
          />
        </div>
      </section>

      <style>{`
        .legal-content h1 {
          font-family: var(--font-heading);
          color: var(--yah-navy);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .legal-content h2 {
          font-family: var(--font-heading);
          color: var(--yah-navy);
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--yah-light-gray);
        }
        .legal-content h3 {
          font-family: var(--font-heading);
          color: var(--yah-navy);
          font-size: 1.0625rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .legal-content p {
          color: var(--yah-slate);
          font-size: 0.9375rem;
          line-height: 1.7;
          margin-bottom: 0.875rem;
        }
        .legal-content ul {
          margin: 0 0 1rem 0;
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .legal-content li {
          color: var(--yah-slate);
          font-size: 0.9375rem;
          line-height: 1.6;
        }
        .legal-content strong {
          color: var(--yah-navy);
          font-weight: 600;
        }
        .legal-content a {
          color: var(--yah-teal);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .legal-content a:hover {
          color: var(--yah-navy);
        }
      `}</style>
    </>
  );
}

'@

# --- Ensure target directories exist ---
New-Item -ItemType Directory -Force -Path "src\app\privacy" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\terms" | Out-Null

# --- Write files ---
$fullPath_privacy = Join-Path (Get-Location) "src\app\privacy\page.tsx"
[System.IO.File]::WriteAllText($fullPath_privacy, $privacyContent, $utf8NoBom)
Write-Host "Written: src\app\privacy\page.tsx" -ForegroundColor Green
$fullPath_terms = Join-Path (Get-Location) "src\app\terms\page.tsx"
[System.IO.File]::WriteAllText($fullPath_terms, $termsContent, $utf8NoBom)
Write-Host "Written: src\app\terms\page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Verifying contents..." -ForegroundColor Cyan
$check_privacy = Get-Content -LiteralPath "src\app\privacy\page.tsx" -Raw
if ($check_privacy -match "PrivacyPolicyPage") { Write-Host "OK: src\app\privacy\page.tsx contains PrivacyPolicyPage" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\privacy\page.tsx missing expected content" -ForegroundColor Red }
if ($check_privacy -match "[\u00C0-\u00FF]{2,}") { Write-Host "WARNING: src\app\privacy\page.tsx may contain garbled encoding" -ForegroundColor Yellow }
$check_terms = Get-Content -LiteralPath "src\app\terms\page.tsx" -Raw
if ($check_terms -match "TermsOfUsePage") { Write-Host "OK: src\app\terms\page.tsx contains TermsOfUsePage" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\terms\page.tsx missing expected content" -ForegroundColor Red }
if ($check_terms -match "[\u00C0-\u00FF]{2,}") { Write-Host "WARNING: src\app\terms\page.tsx may contain garbled encoding" -ForegroundColor Yellow }

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Recurse -Force .next"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Then visit /privacy and /terms, and check the footer links work." -ForegroundColor Cyan
