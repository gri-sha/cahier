import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { currentUserTheme } from "@/lib/user-theme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "privacy",
  description: "What cahier collects, why, where it goes, and your rights.",
  alternates: { canonical: "/privacy" },
};

const CONTACT = "hello@cahier.fyi";

export default async function PrivacyPage() {
  const theme = await currentUserTheme();
  return (
    <LegalPage title="Privacy" updated="22 July 2026" theme={theme}>
      <LegalSection label="Who runs cahier">
        <p>
          Cahier is a personal, non-commercial project run by an individual based in France — not a
          company. For anything in this policy, or to exercise any of the rights below, write to{" "}
          <a className="btn base" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
          . That address is the data controller&apos;s contact point.
        </p>
      </LegalSection>

      <LegalSection label="What cahier collects">
        <p>
          An account is an email address and a username. The markdown you write is stored so it can
          be shown back to you and, if you publish, to your readers. That is the whole product.
        </p>
        <p>
          Signing in also creates a session: alongside its cookie, cahier records the IP address and
          browser identifier the session was opened from, as a routine security measure. The hosting
          provider keeps short-lived technical logs of requests (including IP addresses), as
          virtually all hosting does.
        </p>
      </LegalSection>

      <LegalSection label="Why, in legal terms">
        <p>
          Everything above is processed because it is necessary to provide the service you signed up
          for (in GDPR terms, performance of a contract — Article 6(1)(b)), and to keep it secure
          (legitimate interest). There is no profiling and no automated decision-making.
        </p>
      </LegalSection>

      <LegalSection label="Cookies">
        <p>
          Cahier sets exactly one cookie: the session cookie that keeps you signed in. It is
          strictly necessary, which is why there is no cookie banner — there is nothing to consent
          to. No analytics cookies, no advertising cookies, no third-party cookies of any kind.
        </p>
      </LegalSection>

      <LegalSection label="What is public">
        <p>
          Publishing puts your page at cahier.fyi/username, visible to anyone with the link. That is
          the point of the service. Drafts stay private until you publish, and unpublishing takes
          the page down.
        </p>
        <p>
          Whatever you put on your page — names, contacts, work history — is published by your
          choice. Don&apos;t publish what you don&apos;t want public.
        </p>
      </LegalSection>

      <LegalSection label="Where data lives and goes">
        <p>
          Cahier runs on service providers that process data on its behalf: Vercel (hosting), Neon
          (database) and Resend (delivering sign-in codes). They store data to run the service and
          for nothing else, under data-processing agreements.
        </p>
        <p>
          Some of these providers are US companies, so data can be processed outside the European
          Union. Where it is, the transfer relies on the safeguards European law recognises —
          standard contractual clauses or the EU-US Data Privacy Framework.
        </p>
      </LegalSection>

      <LegalSection label="How long data is kept">
        <p>
          Your account, document and published page are kept until you delete them. Sessions expire
          automatically after about a week of inactivity. Sign-in codes expire after ten minutes.
          Hosting logs are kept briefly by the providers and rotate away on their own. When you
          delete your account, everything above is deleted with it.
        </p>
      </LegalSection>

      <LegalSection label="What cahier doesn't do">
        <p>
          No analytics trackers, no ads, no profiling. Cahier does not sell your personal
          information, does not share it for advertising, and never will while this page says so. If
          any of this ever changes, this page changes first.
        </p>
      </LegalSection>

      <LegalSection label="Your rights">
        <p>
          Wherever you live, you can ask what cahier holds about you, have it corrected, receive a
          copy in a portable format, or have it deleted. Most of this you can do yourself: your page
          is your markdown, and settings → delete account in the editor removes the account, the
          document and the published page — completely and immediately. For anything else, email{" "}
          <a className="btn base" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>{" "}
          from your account address.
        </p>
        <p>
          If you believe cahier has mishandled your data, you can complain to a supervisory
          authority. In France, where cahier is based, that is the CNIL (cnil.fr); if you are
          elsewhere, your local data-protection authority can take the complaint too.
        </p>
      </LegalSection>

      <LegalSection label="Children">
        <p>
          Cahier is not aimed at children. You must be at least 15 years old to use it — or older,
          if your country sets a higher age for consenting to the processing of your data.
        </p>
      </LegalSection>

      <LegalSection label="Legal notice">
        <p>
          Cahier is published by a private individual acting in a non-professional capacity, as
          French law permits (LCEN, art. 6), and is hosted by Vercel Inc., 440 N Barranca Ave #4133,
          Covina, CA 91723, United States — vercel.com. The publisher&apos;s identity is held by the
          host.
        </p>
      </LegalSection>

      <LegalSection label="Changes">
        <p>If this policy changes, the new version appears here with a new date.</p>
      </LegalSection>
    </LegalPage>
  );
}
