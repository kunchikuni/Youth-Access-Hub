  /**
 * Contact Page — /contact
 * @module app/contact/page
 */
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Youth Access Hub — whether you're a young person seeking opportunities, a professional wanting to mentor, or an organisation ready to partner.",
};

const CONTACT_OPTIONS = [
  { icon: "📧", title: "Email Us", value: "info@youthaccesshub.org", href: "mailto:info@youthaccesshub.org", color: "var(--yah-teal)" },
  { icon: "📍", title: "Find Us", value: "Harare, Zimbabwe", href: null, color: "var(--yah-orange)" },
];

const GET_INVOLVED = [
  { title: "I'm a young person", description: "Looking for mentorship, opportunities, or guidance on your next step.", intent: "program" as const, accent: "var(--yah-orange)" },
  { title: "I want to mentor", description: "A professional ready to guide and invest in the next generation.", intent: "mentor" as const, accent: "var(--yah-teal)" },
  { title: "Partner with us", description: "An organisation wanting to connect your services to youth.", intent: "partner" as const, accent: "var(--yah-sky)" },
];

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-16 md:py-20">
          <SectionHeading eyebrow="Reach Out" title="Get In Touch"
            subtitle="Whether you're a young person, a professional, or an organisation — we'd love to hear from you. Fill in the form and a YAH coordinator will respond within 2 business days."
            color="light" decorativeBar accent="orange" />
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12" style={{ display: "block", fill: "var(--yah-off-white)" }}>
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>0

      {/* Main content */}
      <section style={{ backgroundColor: "var(--yah-off-white)" }}>
        <div className="container-yah py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left sidebar */}
            <div className="flex flex-col gap-8">
              {/* Why reach out */}
              <div>
                <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>Who Should Reach Out?</h2>
                <div className="flex flex-col gap-4">
                  {GET_INVOLVED.map(({ title, description, accent }) => (
                    <div key={title} className="p-4 rounded-xl" style={{ backgroundColor: "var(--yah-white)", border: "1px solid var(--yah-light-gray)" }}>
                      <div className="w-1 h-6 rounded-full mb-3" style={{ backgroundColor: accent }} aria-hidden="true" />
                      <h3 className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>{title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--yah-slate)" }}>{description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact details */}
              <div>
                <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>Contact Details</h2>
                <div className="flex flex-col gap-4">
                  {CONTACT_OPTIONS.map(({ icon, title, value, href, color }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                        style={{ backgroundColor: `${color}18`, color }} aria-hidden="true">{icon}</div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--yah-slate)", fontFamily: "var(--font-heading)" }}>{title}</p>
                        {href ? (
                          <a href={href} className="text-sm font-medium hover:underline underline-offset-4" style={{ color: "var(--yah-navy)" }}>{value}</a>
                        ) : (
                          <p className="text-sm" style={{ color: "var(--yah-navy)" }}>{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--yah-white)", border: "1px solid var(--yah-light-gray)", boxShadow: "var(--shadow-card)" }}>
                <h2 className="font-bold text-xl mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
