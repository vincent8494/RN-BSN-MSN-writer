import { BRAND, CONTACT } from "../data.js";
import { Link } from "../router.jsx";

const UPDATED = "July 11, 2026";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function Terms() {
  return (
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Legal</span>
          <h1 className="section-title text-white text-4xl mt-2 mb-2">Terms &amp; Conditions</h1>
          <p className="text-academic-200 text-sm">Last updated: {UPDATED}</p>
        </div>
      </section>

      <section className="py-14 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 card-academic p-6 sm:p-10">
          <Section title="1. Agreement">
            <p>
              By using this website or placing an order with {BRAND.name}, you agree to these terms and our{" "}
              <Link to="/privacy" className="text-academic-600 font-semibold hover:text-academic-700">Privacy Policy</Link>.
              If you do not agree, please do not use the service.
            </p>
          </Section>

          <Section title="2. The service">
            <p>
              We provide academic assistance, research, tutoring and writing-support services for nursing, healthcare
              and social-work students. Materials we deliver are intended for research, reference and study purposes.
              You are responsible for using them in line with your institution's academic policies.
            </p>
          </Section>

          <Section title="3. Orders, quotes & payment">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Prices shown by the online calculator are estimates; the final quote is confirmed with our team on WhatsApp or email before work begins.</li>
              <li>Payment terms (including pay-after-completion on eligible orders) are agreed per order. Work begins once the agreed payment step is complete.</li>
            </ul>
          </Section>

          <Section title="4. Revisions & satisfaction">
            <p>
              Unlimited free revisions are included on eligible orders until the delivered work meets the agreed
              instructions and rubric. Revision requests should reference the original instructions; new requirements
              may be quoted as additional work.
            </p>
          </Section>

          <Section title="5. Refunds">
            <p>
              If we fail to deliver against the agreed instructions after reasonable revision attempts, you may request
              a partial or full refund, assessed case by case. Contact us first — most issues are resolved with a fast
              revision.
            </p>
          </Section>

          <Section title="6. Originality & confidentiality">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Every order is prepared from scratch, is plagiarism-free, and is never resold or published.</li>
              <li>We never share your identity, school or order details with third parties.</li>
              <li>Communications may be deleted after order completion on request.</li>
            </ul>
          </Section>

          <Section title="7. Acceptable use">
            <p>
              You agree not to misuse the site — including attempting to breach security, submitting unlawful content,
              or infringing others' rights. Accounts used abusively may be suspended.
            </p>
          </Section>

          <Section title="8. Liability">
            <p>
              The service is provided "as is". To the maximum extent permitted by law, {BRAND.name} is not liable for
              indirect or consequential losses arising from use of the site or materials. Nothing in these terms limits
              rights you have under applicable law.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about these terms? Message us on{" "}
              <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="text-academic-600 font-semibold hover:text-academic-700">WhatsApp</a>{" "}
              or email{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-academic-600 font-semibold hover:text-academic-700 break-all">{CONTACT.email}</a>.
            </p>
          </Section>
        </div>
      </section>
    </main>
  );
}
