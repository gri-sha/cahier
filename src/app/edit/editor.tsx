"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Circle, GearSix, List } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import {
  confirmEmailChange,
  deleteAccount,
  publish,
  requestEmailChange,
  saveDraft,
  setTheme,
  unpublish,
  updateUsername,
} from "@/app/actions";
import { themes, themeNames, type ThemeName } from "@/lib/themes";
import { ThemeSync } from "@/components/theme-sync";
import { Doc } from "@/components/doc";
import { OtpInput, UsernameField } from "@/components/fields";

type Published = { content: string | null; theme: string | null };

function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open, onClose, ref]);
}

function ThemeMenu({ theme, onPick }: { theme: ThemeName; onPick: (t: ThemeName) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  const groups = (["light", "dark"] as const).map((kind) => ({
    kind,
    names: themeNames.filter((n) => themes[n].kind === kind),
  }));

  return (
    <div ref={ref} className="hdr-menu">
      <button className="btn minor" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        theme ▾
      </button>
      {open && (
        <div className="menu">
          {groups.map((g) => (
            <div key={g.kind} className="theme-group">
              <p className="minor text-fg-55 select-none">{g.kind}</p>
              {g.names.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    onPick(n);
                    setOpen(false);
                  }}
                  className={`btn minor mt-1-5 flex items-center gap-1-5 ${n === theme ? "" : "text-fg-55"}`}
                >
                  {themes[n].label}
                  {n === theme && <Circle size="0.5em" weight="fill" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type SettingsPanel = "menu" | "email" | "email-code" | "username" | "delete";

function SettingsMenu({
  email,
  username,
  onEmailChanged,
  onUsernameChanged,
  onSignOut,
  onDeleted,
}: {
  email: string;
  username: string;
  onEmailChanged: (email: string) => void;
  onUsernameChanged: (username: string) => void;
  onSignOut: () => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<SettingsPanel>("menu");
  const [value, setValue] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPanel("menu");
    setValue("");
    setError(null);
    setPending(false);
  }, []);
  useDismiss(ref, open, close);

  function show(next: SettingsPanel, initial = "") {
    setPanel(next);
    setValue(initial);
    setError(null);
  }

  async function submitEmail() {
    setPending(true);
    setError(null);
    const res = await requestEmailChange(value);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPendingEmail(value.trim().toLowerCase());
    show("email-code");
  }

  async function submitCode(code: string) {
    setPending(true);
    setError(null);
    const res = await confirmEmailChange(code);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      setValue("");
      return;
    }
    onEmailChanged(res.email);
    close();
  }

  async function submitUsername() {
    setPending(true);
    setError(null);
    const res = await updateUsername(value);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onUsernameChanged(res.username);
    close();
  }

  async function submitDelete() {
    setPending(true);
    setError(null);
    const res = await deleteAccount();
    if (!res.ok) {
      setPending(false);
      setError(res.error);
      return;
    }
    // stay "deleting…" through the navigation away
    onDeleted();
  }

  return (
    <div ref={ref} className="hdr-menu">
      <button
        className="btn minor icon-btn text-fg-55 hover-fg"
        aria-label="settings"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {/* nudge the icon down 1px so it seats on the mono chrome's optical center */}
        <GearSix size={17} className="translate-y-px" />
      </button>

      {open && (
        <div className="menu w-64">
          {panel === "menu" && (
            <>
              <p className="minor break-all text-fg-55 select-none">{email}</p>
              <button className="btn minor mt-3 block" onClick={() => show("email")}>
                change email
              </button>
              <button className="btn minor mt-2 block" onClick={() => show("username", username)}>
                change username
              </button>
              <button className="btn minor mt-2 block text-fg-55" onClick={onSignOut}>
                sign out
              </button>
              <hr className="my-3 border-0 border-t border-fg-15" />
              <button className="btn minor block text-fg-55" onClick={() => show("delete")}>
                delete account
              </button>
            </>
          )}

          {panel === "delete" && (
            <div>
              <p className="minor text-fg-55 select-none">delete account</p>
              <p className="base mt-2">
                this deletes your account, your document and the published page. there is no undo.
                we recommend to:
              </p>
              {error && <p className="minor mt-2 text-fg">{error}</p>}
              <button
                className="btn minor mt-4 block"
                type="button"
                onClick={() => show("menu")}
                disabled={pending}
              >
                &lt;- go back
              </button>
              <hr className="my-3 border-0 border-t border-fg-15" />
              <button
                className="btn minor block text-fg-55"
                onClick={submitDelete}
                disabled={pending}
              >
                {pending ? "deleting…" : "delete forever"}
              </button>
            </div>
          )}

          {panel === "email" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (value && !pending) submitEmail();
              }}
            >
              <p className="minor text-fg-55 select-none">new email</p>
              <input
                className="field minor mt-2"
                type="email"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="name@domain.com"
                autoFocus
                required
              />
              {error && <p className="minor mt-2 text-fg">{error}</p>}
              <p className="mt-4 flex gap-4">
                <button
                  className="btn minor inline-flex items-center gap-1-5"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? "sending…" : <>send code -&gt;</>}
                </button>
                <button
                  className="btn minor flex items-center text-fg-55"
                  type="button"
                  onClick={() => show("menu")}
                  aria-label="back"
                >
                  &lt;-
                </button>
              </p>
            </form>
          )}

          {panel === "email-code" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (value.length === 6 && !pending) submitCode(value);
              }}
            >
              <p className="minor text-fg-55">
                code sent to <span className="text-fg">{pendingEmail}</span>
              </p>
              <OtpInput
                value={value}
                onChange={setValue}
                onComplete={(digits) => {
                  if (!pending) submitCode(digits);
                }}
                className="mt-2"
                autoFocus
              />
              {error && <p className="minor mt-2 text-fg">{error}</p>}
              <p className="mt-4 flex gap-4">
                <button
                  className="btn minor inline-flex items-center gap-1-5"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? "checking…" : <>confirm -&gt;</>}
                </button>
                <button
                  className="btn minor flex items-center text-fg-55"
                  type="button"
                  onClick={() => show("email")}
                  aria-label="back"
                >
                  &lt;-
                </button>
              </p>
            </form>
          )}

          {panel === "username" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (value && !pending) submitUsername();
              }}
            >
              <p className="minor text-fg-55 select-none">username</p>
              <UsernameField value={value} onChange={setValue} className="minor mt-2" autoFocus />
              <p className="minor mt-2 text-fg-55">changing it moves your public link.</p>
              {error && <p className="minor mt-2 text-fg">{error}</p>}
              <p className="mt-4 flex gap-4">
                <button
                  className="btn minor inline-flex items-center gap-1-5"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? "saving…" : <>save -&gt;</>}
                </button>
                <button
                  className="btn minor flex items-center text-fg-55"
                  type="button"
                  onClick={() => show("menu")}
                  aria-label="back"
                >
                  &lt;-
                </button>
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export function Editor({
  username: initialUsername,
  email: initialEmail,
  initialContent,
  initialTheme,
  initialPublished,
}: {
  username: string;
  email: string;
  initialContent: string;
  initialTheme: ThemeName;
  initialPublished: Published;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [save, setSave] = useState<"saved" | "saving" | "error">("saved");
  const [pub, setPub] = useState<Published>(initialPublished);
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [note, setNote] = useState<string | null>(null);
  // phones only: the header's list toggle that discloses the action buttons
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const closeActions = useCallback(() => setActionsOpen(false), []);
  useDismiss(actionsRef, actionsOpen, closeActions);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(initialContent);
  const dirty = useRef(false);

  const isLive = pub.content !== null;
  const pubDirty = isLive && (pub.content !== content || pub.theme !== theme);

  const autosize = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    // Browsers with field-sizing:content grow the textarea in CSS (globals.css);
    // measuring scrollHeight here would set an inline height that overrides it.
    if (typeof CSS !== "undefined" && CSS.supports("field-sizing: content")) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    if (mode === "edit") autosize();
  }, [mode, autosize]);

  const flashNote = useCallback((text: string) => {
    setNote(text);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 2200);
  }, []);

  const flushSave = useCallback(async (text: string): Promise<boolean> => {
    setSave("saving");
    const res = await saveDraft(text);
    if (latest.current !== text) return false; // superseded by newer keystrokes
    if (res.ok) {
      setSave("saved");
      dirty.current = false;
      return true;
    }
    setSave("error");
    return false;
  }, []);

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setContent(text);
    latest.current = text;
    dirty.current = true;
    autosize();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flushSave(text), 800);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        flushSave(latest.current).then((ok) => {
          if (ok) flashNote("saved");
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flushSave, flashNote]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  async function pickTheme(next: ThemeName) {
    if (next === theme) return;
    const prev = theme;
    // ThemeSync mirrors the state change onto <html>
    setThemeState(next);
    const res = await setTheme(next);
    if (!res.ok) {
      setThemeState(prev);
      flashNote("couldn't switch theme — try again");
    }
  }

  async function doPublish() {
    setActionsOpen(false);
    setBusy(true);
    // "publishing…" stays up at least this long — a fast server round-trip
    // otherwise flashes the label for a frame before the button vanishes.
    const minBusy = new Promise((r) => setTimeout(r, 1000));
    if (timer.current) clearTimeout(timer.current);
    const saved = await saveDraft(latest.current);
    if (!saved.ok) {
      setSave("error");
      await minBusy;
      setBusy(false);
      return;
    }
    setSave("saved");
    dirty.current = false;
    const [res] = await Promise.all([publish(), minBusy]);
    if (res.ok) {
      setPub({ content: res.publishedContent, theme: res.publishedTheme });
    } else {
      flashNote(res.error);
    }
    setBusy(false);
  }

  async function doUnpublish() {
    setActionsOpen(false);
    setBusy(true);
    const res = await unpublish();
    if (res.ok) setPub({ content: null, theme: null });
    else flashNote(res.error);
    setBusy(false);
  }

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  async function accountDeleted() {
    // the server already dropped the sessions; this just clears the cookie
    try {
      await authClient.signOut();
    } catch {}
    router.push("/");
    router.refresh();
  }

  return (
    <div data-theme={theme} className="min-h-dvh bg-bg text-fg">
      <ThemeSync theme={theme} />
      <header className="relative flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-fg-10 px-5 py-3 sm-px-8">
        {/* Inline flow, not flex: the space between the links is a real text
            node, shrunk to the intended gap by .brandrow's word-spacing. */}
        <div className="brandrow minor mr-auto">
          <Link href="/" className="wordmark">
            cahier
          </Link>
          {isLive && (
            <>
              {" "}
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                className="btn minor text-fg-55"
                title={`cahier.fyi/${username}`}
              >
                /{username}
              </a>
            </>
          )}
        </div>

        {/* Document actions. Desktop: flex items of the header row
            (display:contents). Phones: collapsed behind the list toggle and
            disclosed as a stacked panel under the header (see .hdr-actions);
            tapping outside — including into the text — dismisses it. */}
        <div ref={actionsRef} className="contents">
          <div className="hdr-actions" data-open={actionsOpen || undefined}>
            {/* The transient "publish changes" sits leftmost in the group so
                its appearing/disappearing never shifts the other buttons. */}
            {isLive && pubDirty && (
              <button onClick={doPublish} disabled={busy} className="btn minor">
                {busy ? "publishing…" : "publish changes"}
              </button>
            )}

            {!isLive ? (
              <button onClick={doPublish} disabled={busy} className="btn minor">
                {busy ? "publishing…" : "publish"}
              </button>
            ) : (
              <button onClick={doUnpublish} disabled={busy} className="btn minor text-fg-55">
                unpublish
              </button>
            )}

            <button
              onClick={() => {
                setActionsOpen(false);
                setMode((m) => (m === "edit" ? "preview" : "edit"));
              }}
              className="btn minor"
            >
              {mode === "edit" ? "preview" : "edit"}
            </button>

            <ThemeMenu theme={theme} onPick={pickTheme} />
          </div>

          <button
            className="btn minor icon-btn sm-hidden"
            aria-label="actions"
            aria-expanded={actionsOpen}
            onClick={() => setActionsOpen((o) => !o)}
          >
            <List size={17} className="translate-y-px" />
          </button>
        </div>

        <SettingsMenu
          email={email}
          username={username}
          onEmailChanged={setEmail}
          onUsernameChanged={setUsername}
          onSignOut={signOut}
          onDeleted={accountDeleted}
        />

        {(save === "error" || save === "saving" || note) && (
          <span className={`minor save-note ${save === "error" ? "text-fg" : "text-fg-55"}`}>
            {save === "error"
              ? "couldn't save — retrying on next edit"
              : save === "saving"
                ? "saving…"
                : note}
          </span>
        )}
      </header>

      <main className="editor-main">
        <div className="editor-column">
          {mode === "edit" ? (
            <textarea
              ref={taRef}
              className="editor-ta"
              value={content}
              onChange={onChange}
              onFocus={closeActions}
              placeholder="# your name"
              aria-label="cv markdown"
              spellCheck={false}
              autoFocus
            />
          ) : (
            <Doc content={content} />
          )}
        </div>
      </main>
    </div>
  );
}
