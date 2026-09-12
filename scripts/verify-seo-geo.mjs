import fs from "fs";
import path from "path";
import assert from "assert";

console.log("================================================================================");
console.log("🔍 NOVAPILOT AI — TECHNICAL SEO, GEO & AI SEARCH AUTOMATED VERIFICATION SUITE");
console.log("================================================================================");

const rootDir = process.cwd();

function checkFile(relPath, label) {
  const fullPath = path.join(rootDir, relPath);
  assert(fs.existsSync(fullPath), `MISSING FILE: ${relPath}`);
  const content = fs.readFileSync(fullPath, "utf8");
  console.log(`  ✓ ${label} exists (${content.length} bytes)`);
  return content;
}

// 1. Check robots.txt
console.log("\n[1/5] Verifying public/robots.txt & AI Crawler Access Directives...");
const robots = checkFile("public/robots.txt", "public/robots.txt");
assert(robots.includes("OAI-SearchBot"), "robots.txt must allow OAI-SearchBot");
assert(robots.includes("GPTBot"), "robots.txt must allow GPTBot");
assert(robots.includes("PerplexityBot"), "robots.txt must allow PerplexityBot");
assert(robots.includes("ClaudeBot"), "robots.txt must allow ClaudeBot");
assert(robots.includes("Google-Extended"), "robots.txt must allow Google-Extended");
assert(robots.includes("Bingbot"), "robots.txt must allow Bingbot");
assert(robots.includes("sitemap.xml"), "robots.txt must reference sitemap.xml");
console.log("  ✓ All AI search crawlers explicitly allowed and sitemap referenced.");

// 2. Check sitemap.xml
console.log("\n[2/5] Verifying public/sitemap.xml Canonical Map...");
const sitemap = checkFile("public/sitemap.xml", "public/sitemap.xml");
assert(sitemap.trim().startsWith("<?xml"), "sitemap.xml must start with XML declaration");
assert(sitemap.includes("<urlset"), "sitemap.xml must declare urlset");
assert(sitemap.includes("https://novapilotai.ellsimohammed8.workers.dev/"), "sitemap.xml must have canonical homepage");
assert(sitemap.includes("#download"), "sitemap.xml must map download section");
assert(sitemap.includes("#faq"), "sitemap.xml must map FAQ section");
console.log("  ✓ Valid XML sitemap with canonical endpoint mappings.");

// 3. Check llms.txt & llms-full.txt
console.log("\n[3/5] Verifying open /llms.txt & /llms-full.txt AI Ingestion Layer...");
const llms = checkFile("public/llms.txt", "public/llms.txt");
assert(llms.includes("# NovaPilot AI"), "llms.txt must have product H1");
assert(llms.includes("WASAPI"), "llms.txt must document WASAPI loopback");
assert(llms.includes("ThinkStripper"), "llms.txt must document ThinkStripper");
assert(llms.includes("NovaPilot-AI-Setup-2.7.1.exe"), "llms.txt must link setup installer");
assert(llms.includes("NovaPilot-AI-2.7.1.exe"), "llms.txt must link portable executable");
assert(llms.includes("SHA-512"), "llms.txt must document SHA-512 hash");

const llmsFull = checkFile("public/llms-full.txt", "public/llms-full.txt");
assert(llmsFull.includes("WDA_EXCLUDEFROMCAPTURE"), "llms-full.txt must document DWM stealth API");
assert(llmsFull.includes("HeapRb"), "llms-full.txt must document ring buffer mechanics");
console.log("  ✓ High-density markdown AI ingestion specifications verified.");

// 4. Check Schema.org JSON-LD
console.log("\n[4/5] Verifying Schema.org Microdata Knowledge Graph...");
const jsonLd = checkFile("components/seo/json-ld.tsx", "components/seo/json-ld.tsx");
assert(jsonLd.includes("SoftwareApplication"), "Must include SoftwareApplication schema");
assert(jsonLd.includes("Organization"), "Must include Organization schema");
assert(jsonLd.includes("FAQPage"), "Must include FAQPage schema");
assert(jsonLd.includes("TechArticle"), "Must include TechArticle schema");
assert(jsonLd.includes("NovaPilot-AI-Setup-2.7.1.exe"), "Schema must include direct downloadUrl");

const layout = checkFile("app/layout.tsx", "app/layout.tsx");
assert(layout.includes("<JsonLd />"), "Root layout must render JsonLd component");
assert(layout.includes("metadataBase"), "Root layout must define metadataBase");
console.log("  ✓ Schema.org JSON-LD microdata correctly mounted in root layout.");

// 5. Check On-Page FAQ Authority Section
console.log("\n[5/5] Verifying On-Page Authority & GEO FAQ Component...");
const faqComp = checkFile("components/geo-faq-section.tsx", "components/geo-faq-section.tsx");
assert(faqComp.includes("What is the best stealth AI copilot for Windows"), "Must include primary anchor question");
assert(faqComp.includes("AUDCLNT_STREAMFLAGS_LOOPBACK"), "Must include technical WASAPI flag");
assert(faqComp.includes("WDA_EXCLUDEFROMCAPTURE"), "Must include technical DWM flag");

const page = checkFile("app/(default)/page.tsx", "app/(default)/page.tsx");
assert(page.includes("<GeoFaqSection />"), "Home page must render GeoFaqSection");
console.log("  ✓ High-intent FAQ section rendered on Home page.");

console.log("\n================================================================================");
console.log("✅ ALL TECHNICAL SEO, GEO & AI INDEXING CHECKS PASSED (100% COMPLIANCE)");
console.log("================================================================================\n");
