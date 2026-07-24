import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// cahier's paper theme, transposed to email-safe values. Monochrome like the
// site: every bit of text is the one ink color, hierarchy comes from size and
// weight alone. Web fonts don't load in most mail clients, so the wordmark
// leans on a handwriting stack (a nod to Shadows Into Light) that degrades to
// the client's cursive, and the code uses a Roboto Mono stack.
const INK = "#111111";
const RULE = "#e6e6e6";

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'Roboto Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const HAND = "'Bradley Hand','Segoe Script','Snell Roundhand',cursive";

export function codeEmailHtml(otp: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <style>
      @media (prefers-color-scheme: dark) {
        .bg { background: #000000 !important; }
        .card { background: #0a0a0a !important; }
        .ink { color: #ffffff !important; }
        .rule { border-color: #262626 !important; }
      }
    </style>
  </head>
  <body class="bg" style="margin:0;padding:0;background:#ffffff;">
    <!-- preheader (hidden preview text) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      your cahier code is ${otp}, good for ten minutes.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:40px 24px;">
          <table role="presentation" width="440" cellpadding="0" cellspacing="0" class="card" style="width:440px;max-width:100%;background:#ffffff;">
            <tr>
              <td class="rule" style="padding:40px 40px 40px 34px;border-left:2px solid ${RULE};">
                <div class="ink" style="font-family:${HAND};font-size:30px;line-height:1;color:${INK};">cahier</div>

                <div class="ink" style="font-family:${SANS};font-size:15px;line-height:1;color:${INK};padding:28px 0 0;">
                  your sign-in code
                </div>

                <div class="ink" style="font-family:${MONO};font-size:40px;font-weight:700;letter-spacing:0.18em;color:${INK};line-height:1;padding:28px 0 0;">${otp}</div>

                <div class="ink" style="font-family:${SANS};font-size:14px;line-height:1.6;color:${INK};padding:28px 0 0;">
                  good for ten minutes. if you didn't ask for it, you can ignore this email.
                </div>

                <div class="ink" style="font-family:${MONO};font-size:12px;line-height:1;color:${INK};padding:28px 0 0;">
                  <a href="https://cahier.fyi" class="ink" style="color:${INK};text-decoration:none;">cahier.fyi</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function codeEmailText(otp: string): string {
  return [
    `your sign-in code:`,
    ``,
    `  ${otp}`,
    ``,
    `good for ten minutes. if you didn't ask for it, you can ignore this email.`,
    ``,
    `cahier.fyi`,
  ].join("\n");
}

// One sender for every six-digit code we mail (sign-in, email change).
// Without a RESEND_API_KEY the code is printed to the dev terminal instead.
// The Resend SDK reports failures on the returned `error` field rather than
// throwing, so callers that don't inspect it would happily tell the user a
// code was sent when it wasn't — surface it as a thrown error instead.
export async function sendCodeEmail(to: string, otp: string): Promise<void> {
  if (!resend) {
    console.log(`\n  [cahier] code for ${to}: ${otp}\n`);
    return;
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "cahier <onboarding@resend.dev>",
    to,
    subject: `${otp} is your cahier code`,
    text: codeEmailText(otp),
    html: codeEmailHtml(otp),
  });
  if (error) throw new Error(`resend: ${error.message ?? "failed to send"}`);
}
