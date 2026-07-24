"use client";

import { USERNAME_MAX, sanitizeUsernameInput } from "@/lib/usernames";

// The cahier.fyi/ username row, shared by the start flow and the editor's
// settings so the prefix, sanitizing and length cap can't diverge. The outer
// className carries the row's type (e.g. "urlrow base" or "minor").
export function UsernameField({
  value,
  onChange,
  className = "",
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={`flex items-baseline ${className}`}>
      <span className="text-fg-55 select-none">cahier.fyi/</span>
      <input
        className="field"
        type="text"
        value={value}
        onChange={(e) => onChange(sanitizeUsernameInput(e.target.value))}
        maxLength={USERNAME_MAX}
        placeholder={placeholder}
        autoFocus={autoFocus}
        spellCheck={false}
      />
    </div>
  );
}

// Six-digit OTP entry, shared by the sign-in flow and the email-change flow.
// Strips non-digits and fires onComplete once six are entered.
export function OtpInput({
  value,
  onChange,
  onComplete,
  className = "",
  autoFocus,
}: {
  value: string;
  onChange: (digits: string) => void;
  onComplete: (digits: string) => void;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      className={`field base otp ${className}`}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={value}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
        onChange(digits);
        if (digits.length === 6) onComplete(digits);
      }}
      placeholder="000000"
      autoFocus={autoFocus}
    />
  );
}
