# BrandGuard AI 🛡️
> **"Evidence-backed brand governance before publication. Every content decision. Backed by evidence."**

- **GitHub Repository**: [https://github.com/Shaurya18yadav/BRANDGUARD](https://github.com/Shaurya18yadav/BRANDGUARD)
- **Live GitHub Pages URL**: [https://shaurya18yadav.github.io/BRANDGUARD/](https://shaurya18yadav.github.io/BRANDGUARD/)

BrandGuard AI serves as an active control layer between creator content generation and audience publication. Rather than relying on retroactive human audits, BrandGuard verifies drafts against a version-controlled enterprise brand knowledge base before public release.

---

## ⚡ What It Is
1. **Evidence-Linked Governance**: Every finding maps strictly to an active rule, owner, and versioned source artifact (e.g. Forrester Study v1.2, Customer MSA v4.0).
2. **Time-Aware Knowledge Base**: Expired certifications (e.g. 2022 Gartner badges) and internal factual metric conflicts are surfaced automatically and barred from publication claims.
3. **Version-Bound Approvals (Tamper Evident)**: Publication approval signs off on the exact cryptographic content hash (`sha256-...`). Any post-approval edits immediately invalidate the seal and reopen the draft for compliance review.
4. **Explainable Reasoning Chains**: Every flagged phrase displays an unyielding 6-step chain: Claim → Applicable Rule → Grounded Evidence → Plain Explanation → Suggested Minimal-Change Diff → Recorded Human Decision with mandatory justification.
5. **Governance Learning Loop**: Disputed rules and blocked claims lacking sources are visualized in governance insights to help Brand Managers refine vague guidelines.

---

## 🚀 How to Run Locally

```bash
# 1. Clone repository
git clone https://github.com/Shaurya18yadav/BRANDGUARD.git
cd BRANDGUARD

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

*(Optional)* To test live contextual Gemini AI reviews, add a `.env` file with `VITE_GEMINI_API_KEY=your_key` or click **"Gemini Key"** in the top navigation bar. If no key is provided, the deterministic rules engine and fallback heuristic ensure the demo never breaks.

---

## ⏱️ 60-Second Demo Script (For Judges)

1. **Launch**: Click the yellow **"Guided Demo"** button in the header. The system pre-loads the messy launch draft for *"Nimbus Analytics"*.
2. **Review Workspace**: Click **"Run Governance Review"**. Inspect how the left panel color-highlights violations while the right panel reveals the full **6-step reasoning chain**.
3. **Inspect Expired Badging**: Select the `#1 Gartner` highlight. Notice how BrandGuard identifies that `FACT-003` expired on `2023-12-31`, blocking the claim with the notice: *"Missing evidence is not proof the claim is false, but publication requires re-certification."*
4. **Accept & Apply Corrections**: On the `CloudLens` finding, click **"Accept Fix"**, then click **"Apply All Accepted Corrections"**. Watch the draft automatically update to *"Nimbus Insight"* while preserving original intent.
5. **Version-Bound Sign-Off**: In the header, switch your persona to **Marcus Vance (Legal Reviewer)** and click **"Approve Draft"**. Notice the draft is sealed with a cryptographic hash.
6. **Watch Seal Reset (Crucial Differentiator!)**: Navigate to **"Approvals & Audit"**. In the interactive editor, type or delete a single character. Watch the approval instantly flip to **"Reopened for review"** with a red tamper alert and timestamped audit record!
7. **Governance Insights**: Click **"Governance Insights"** to see which rules get disputed most (unclear rules) and which claims lack certified evidence.

---

## ⚠️ Honest Limitations & Scope
- **Prototype Status**: This is an architectural demonstration and functional prototype.
- **Simulated Data**: Pre-seeded around fictional enterprise SaaS *"Nimbus Analytics"*.
- **Excluded Roadmap Features (Tier 2/3)**: Multi-page PDF/Word intake, OCR visual logo recognition, automated CMS publishing webhooks, and WCAG vector contrast checkers are intentionally represented as roadmap chips.
- **Compliance Disclaimer**: *Design approach and prototype. No regulatory compliance certification, legal indemnity, or production readiness is claimed.*
