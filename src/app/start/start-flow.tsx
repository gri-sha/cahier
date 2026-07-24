"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { claimUsername, postSignInStep } from "@/app/actions";
import { OtpInput, UsernameField } from "@/components/fields";

type Step = "email" | "code" | "username";

export function StartFlow({ initialStep }: { initialStep: Step }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const verifying = useRef(false);

  async function sendCode(): Promise<boolean> {
    setPending(true);
    setError(null);
    setNote(null);
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setPending(false);
    if (err) {
      setError(err.message ?? "couldn't send the code, try again");
      return false;
    }
    setCode("");
    setStep("code");
    return true;
  }

  async function verify(otp: string) {
    if (verifying.current) return;
    verifying.current = true;
    setPending(true);
    setError(null);
    setNote(null);
    const { error: err } = await authClient.signIn.emailOtp({ email, otp });
    if (err) {
      verifying.current = false;
      setPending(false);
      setError("that code didn't match, check the email or resend");
      setCode("");
      return;
    }
    const dest = await postSignInStep();
    if (dest === "edit") {
      router.push("/edit");
      return;
    }
    verifying.current = false;
    setPending(false);
    setStep("username");
  }

  async function claim() {
    setPending(true);
    setError(null);
    const res = await claimUsername(name);
    if (!res.ok) {
      setPending(false);
      setError(res.error);
      return;
    }
    router.push("/edit");
  }

  if (step === "email") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) sendCode();
        }}
      >
        <h1 className="heading">start</h1>
        <p className="minor mt-1 text-fg-55">
          enter your email, we&apos;ll send you a code to sign in
        </p>
        <input
          className="field base mt-8"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@domain.com"
          autoComplete="email"
          autoFocus
          required
        />
        {error && <p className="minor mt-4 text-fg">{error}</p>}
        <p className="mt-8">
          <button
            className="btn base inline-flex items-center gap-1-5"
            type="submit"
            disabled={pending}
          >
            {pending ? "sending…" : <>send code -&gt;</>}
          </button>
        </p>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) verify(code);
        }}
      >
        <h1 className="heading">the code</h1>
        <p className="minor mt-1 text-fg-55">
          sent to <span className="text-fg">{email}</span>
        </p>
        <OtpInput value={code} onChange={setCode} onComplete={verify} className="mt-8" autoFocus />
        {error && <p className="minor mt-4 text-fg">{error}</p>}
        {note && <p className="minor mt-4 text-fg-55">{note}</p>}
        {/* Each action on its own line, text centered on the field's axis
            above; the arrows are absolutely positioned so they don't pull the
            centered text off-axis. */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button className="btn base relative" type="submit" disabled={pending}>
            {pending ? "checking…" : "sign in"}
            {!pending && <span className="side-arrow side-arrow-after">-&gt;</span>}
          </button>
          <button
            className="btn minor text-fg-55"
            type="button"
            disabled={pending}
            onClick={async () => {
              if (await sendCode()) setNote("sent again");
            }}
          >
            resend
          </button>
          <button
            className="btn minor relative text-fg-55"
            type="button"
            disabled={pending}
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
              setNote(null);
            }}
          >
            <span className="side-arrow side-arrow-before">&lt;-</span>
            different email
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name) claim();
      }}
    >
      <h1 className="heading">your link</h1>
      <p className="minor mt-1 text-fg-55">
        lowercase letters, digits, underscores. this becomes your address.
      </p>
      <UsernameField
        value={name}
        onChange={setName}
        className="urlrow base mt-8"
        placeholder="you"
        autoFocus
      />
      {error && <p className="minor mt-4 text-fg">{error}</p>}
      <p className="mt-8">
        <button
          className="btn base inline-flex items-center gap-1-5"
          type="submit"
          disabled={pending}
        >
          {pending ? "claiming…" : <>claim -&gt;</>}
        </button>
      </p>
    </form>
  );
}
