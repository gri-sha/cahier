import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { currentUserTheme } from "@/lib/user-theme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "terms",
  description: "The short rules for publishing your page with cahier.",
  alternates: { canonical: "/terms" },
};

const CONTACT = "hello@cahier.fyi";

export default async function TermsPage() {
  const theme = await currentUserTheme();
  return (
    <LegalPage title="Terms" updated="22 July 2026" theme={theme}>
      <LegalSection label="The service">
        <p>
          Cahier gives your account one markdown document, published as a page at
          cahier.fyi/username. It is free and provided as-is, run by an individual, not a company.
        </p>
      </LegalSection>

      <LegalSection label="Your account">
        <p>
          Sign in with an email address you control; it is how you reach your account and how cahier
          reaches you. You must be at least 15 years old — or older, where your country requires it.
          Usernames are handed out first-come; they are not property, and names used to impersonate
          someone or to squat may be reclaimed.
        </p>
      </LegalSection>

      <LegalSection label="Your content">
        <p>
          What you write stays yours. By publishing you give cahier permission to host and display
          the page publicly — that permission ends when you unpublish or delete. You are responsible
          for what you publish and must hold the rights to it.
        </p>
      </LegalSection>

      <LegalSection label="Acceptable use">
        <p>
          Don&apos;t use cahier for anything illegal, for impersonating others, spam, harassment, or
          distributing malware. Pages that break this can be taken down and the account closed.
        </p>
      </LegalSection>

      <LegalSection label="Reporting a page">
        <p>
          If a published page infringes your rights — your copyright, your identity, your personal
          data — email{" "}
          <a className="btn base" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>{" "}
          with a link to the page and what is wrong with it. Reports are reviewed promptly and pages
          that break these terms are taken down.
        </p>
      </LegalSection>

      <LegalSection label="Availability">
        <p>
          Cahier aims to stay up but promises no uptime, and may change or discontinue the service.
          If it ever shuts down, reasonable notice will be given so you can take your markdown with
          you.
        </p>
      </LegalSection>

      <LegalSection label="Liability">
        <p>
          The service is provided without warranties of any kind. To the extent the law allows,
          cahier is not liable for damages arising from using it or from what its users publish.
          Nothing here limits rights that the law of your country grants you and does not allow to
          be waived.
        </p>
      </LegalSection>

      <LegalSection label="Governing law">
        <p>
          These terms are governed by French law, since that is where cahier is run from. If you use
          cahier as a consumer, you keep any mandatory protections of the law of the country you
          live in.
        </p>
      </LegalSection>

      <LegalSection label="Ending things">
        <p>
          You can stop any time: unpublish, or delete your account in the editor (settings → delete
          account), which removes everything at once. Cahier may suspend accounts that break these
          terms.
        </p>
      </LegalSection>

      <LegalSection label="Changes + contact">
        <p>
          If these terms change, the new version appears here with a new date. Questions go to{" "}
          <a className="btn base" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
