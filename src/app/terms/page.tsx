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
