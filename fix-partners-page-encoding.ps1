# ============================================================
# Fix script: corrects character encoding on the public Partners
# page by replacing literal arrow characters (-> rendered as garbled
# bytes due to a prior PowerShell 5.1 encoding issue) with the
# existing ArrowIcon SVG component, matching the pattern already
# used in Hero.tsx and CTABanner.tsx.
#
# This file is now fully ASCII - zero non-ASCII characters remain,
# making it immune to this class of encoding bug going forward.
#
# Run this from your project ROOT (where package.json lives):
#   .\fix-partners-page-encoding.ps1
# ============================================================

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$partnersPageContent = @'
/**
 * Partners Page - /partners
 * @module app/partners/page
 */
import type { Metadata } from "next";
import { getPartners } from "@/lib/getData";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge, { categoryBadge } from "@/components/ui/Badge";
import CTABanner from "@/components/sections/CTABanner";
import { ArrowIcon } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Our Partners",
  description: "Meet the schools, universities, corporates, NGOs and government bodies partnering with Youth Access Hub to connect youth to opportunities.",
};

export default async function PartnersPage() {
  const partners = await getPartners();
  const featured = partners.filter((p) => p.featured);
  const rest = partners.filter((p) => !p.featured);

  return (
    <>
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-16 md:py-20">
          <SectionHeading eyebrow="Our Network" title="Partner Organisations"
            subtitle="Youth Access Hub works with schools, universities, corporates, NGOs, and government bodies to create pathways for young people. Together, we make the ecosystem work."
            color="light" decorativeBar accent="teal" />
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12" style={{ display: "block", fill: "var(--yah-white)" }}>
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--yah-white)" }}>
        <div className="container-yah py-12 md:py-16">

          {/* Featured partners */}
          <SectionHeading eyebrow="Featured" title="Key Partners" decorativeBar accent="orange" className="mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {featured.map((partner) => (
              <div key={partner.slug} className="p-6 rounded-2xl flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1"
                style={{ backgroundColor: "var(--yah-off-white)", border: "1px solid var(--yah-light-gray)", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ backgroundColor: "rgba(27,47,107,0.08)", color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>
                    {partner.name.charAt(0)}
                  </div>
                  <Badge {...categoryBadge(partner.type)} />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)", fontSize: "1rem" }}>{partner.name}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--yah-slate)" }}>{partner.description}</p>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(43,174,142,0.07)", border: "1px solid rgba(43,174,142,0.15)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--yah-teal)", fontFamily: "var(--font-heading)" }}>Contribution</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--yah-slate)" }}>{partner.contribution}</p>
                  </div>
                </div>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold flex items-center gap-1 hover:underline underline-offset-4"
                    style={{ color: "var(--yah-sky)", fontFamily: "var(--font-heading)" }}>
                    Visit website <ArrowIcon size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* All other partners */}
          {rest.length > 0 && (
            <>
              <SectionHeading eyebrow="Network" title="All Partners" decorativeBar accent="teal" className="mb-10" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rest.map((partner) => (
                  <div key={partner.slug} className="p-5 rounded-xl flex items-start gap-4"
                    style={{ backgroundColor: "var(--yah-off-white)", border: "1px solid var(--yah-light-gray)" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: "rgba(27,47,107,0.08)", color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>
                      {partner.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-sm" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>{partner.name}</h3>
                        <Badge {...categoryBadge(partner.type)} />
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--yah-slate)" }}>{partner.contribution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Become a partner CTA */}
      <section style={{ backgroundColor: "var(--yah-off-white)" }}>
        <div className="container-yah py-14 md:py-16">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
            <SectionHeading eyebrow="Join Our Network" title="Become a Partner" align="center"
              subtitle="Is your organisation working with youth? Partner with Youth Access Hub to expand your reach and impact." decorativeBar accent="teal" />
            <a href="/contact?ref=partner"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "var(--yah-navy)", color: "var(--yah-white)", fontFamily: "var(--font-heading)" }}>
              Get In Touch <ArrowIcon size={14} />
            </a>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}

'@

$destPath = "src\app\partners\page.tsx"
$fullPath = Join-Path (Get-Location) $destPath

[System.IO.File]::WriteAllText($fullPath, $partnersPageContent, $utf8NoBom)
Write-Host "Written: $destPath" -ForegroundColor Green

Write-Host ""
Write-Host "Verifying contents..." -ForegroundColor Cyan

$check = Get-Content -LiteralPath $destPath -Raw

if ($check -match "PartnersPage") {
    Write-Host "OK: $destPath contains PartnersPage" -ForegroundColor Green
} else {
    Write-Host "PROBLEM: $destPath missing expected content" -ForegroundColor Red
}

if ($check -match "ArrowIcon") {
    Write-Host "OK: $destPath uses ArrowIcon component" -ForegroundColor Green
} else {
    Write-Host "PROBLEM: ArrowIcon import/usage missing" -ForegroundColor Red
}

# Confirm no garbled multi-byte sequences remain (the tell-tale
# Ã¢â‚¬â€œ style corruption pattern from before)
if ($check -match "[\u00C0-\u00FF]{2,}") {
    Write-Host "WARNING: possible garbled encoding still detected - check manually" -ForegroundColor Yellow
} else {
    Write-Host "OK: no garbled multi-byte sequences detected" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Recurse -Force .next"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Then check /partners - 'Visit website' and 'Get In Touch' should show a clean arrow icon, not garbled text." -ForegroundColor Cyan
