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

export default function Privacy() {
  return (
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Legal</span>
          <h1 className="section-title text-white text-4xl mt-2 mb-2">Privacy Policy</h1>
          <p className="text-academic-200 text-sm">Last updated: {UPDATED}</p>
        </div>
      </section>

      <section className="py-14 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 card-academic p-6 sm:p-10">
          <Section title="Our commitment">
            <p>
              {BRAND.name} ("we", "us") is built on confidentiality. Your identity, account details and order
              information are never shared, sold or disclosed to third parties — including your school. This policy
              explains what we collect, why, and the choices you have.
            </p>
          </Section>

          <Section title="Information we collect">
            <p>We collect only what's needed to run the service:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account details</strong> — your name, email address and academic level when you sign up. Passwords are stored only as salted cryptographic hashes; we cannot read them.</li>
              <li><strong>Order details</strong> — the assignment information you enter (school, course, pages, deadline, instructions and any files you choose to share).</li>
              <li><strong>Messages</strong> — the contact details and text you send through our contact forms or WhatsApp.</li>
              <li><strong>Essential cookies</strong> — a session cookie that keeps you signed in and a preference flag remembering that you dismissed our cookie notice. We do not run third-party advertising or tracking cookies.</li>
            </ul>
          </Section>

          <Section title="How we use your information">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create and manage your account and orders.</li>
              <li>To communicate with you about quotes, progress and delivery.</li>
              <li>To improve our services and website experience.</li>
            </ul>
            <p>We never use your information for third-party marketing, and we never contact your institution.</p>
          </Section>

          <Section title="Confidentiality & retention">
            <p>
              Communications are treated as strictly confidential and deleted on request after your order is complete.
              Completed work is delivered to you and is not shared with or resold to anyone else. You may request
              deletion of your account and associated data at any time.
            </p>
          </Section>

          <Section title="Data security">
            <p>
              We follow industry practice to protect your data: passwords are hashed with a per-user salt, sessions use
              HttpOnly cookies, and access to order data is restricted to the team members working on your request.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              You can request a copy of the personal data we hold about you, ask for corrections, or ask for complete
              deletion ("right to be forgotten"). Message us on{" "}
              <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="text-academic-600 font-semibold hover:text-academic-700">WhatsApp</a>{" "}
              or email{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-academic-600 font-semibold hover:text-academic-700 break-all">{CONTACT.email}</a>{" "}
              and we'll action it promptly.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we change this policy, the new version will be posted on this page with an updated date. Continued use
              of the site after changes means you accept the updated policy. See also our{" "}
              <Link to="/terms" className="text-academic-600 font-semibold hover:text-academic-700">Terms &amp; Conditions</Link>.
            </p>
          </Section>
        </div>
      </section>
    </main>
  );
}
