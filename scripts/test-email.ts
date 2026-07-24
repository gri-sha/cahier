// Preview and optionally send the sign-in code email.
//
//   bun run email:test                 -> writes email-preview.html and opens it
//   bun run email:test you@example.com -> also sends a real email to that address
//
// A real send needs RESEND_API_KEY (and a verified EMAIL_FROM domain); without
// a key the "send" just prints the code to the console, like local dev does.
//
// The preview is opened with a ?t=<timestamp> on the file URL so the browser
// never serves a stale cached copy — every run shows the current template.

import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { codeEmailHtml, codeEmailText, sendCodeEmail } from "../src/lib/email";

const SAMPLE_OTP = "195842";
const recipient = process.argv[2];

const previewPath = join(process.cwd(), "email-preview.html");
writeFileSync(previewPath, codeEmailHtml(SAMPLE_OTP));

const url = `file://${previewPath}?t=${Date.now()}`;
if (process.platform === "darwin") spawnSync("open", [url]);

console.log(`\nHTML preview: ${url}`);
console.log("(reopened fresh each run — it renders differently in light and dark mode)\n");
console.log("plain-text version (fallback for clients that block HTML):\n");
console.log(codeEmailText(SAMPLE_OTP));
console.log("");

if (recipient) {
  if (process.env.RESEND_API_KEY) {
    console.log(`sending a real test email to ${recipient} …`);
  } else {
    console.log(`no RESEND_API_KEY set — the code will print below instead of sending:`);
  }
  await sendCodeEmail(recipient, SAMPLE_OTP);
  console.log("done.");
}
