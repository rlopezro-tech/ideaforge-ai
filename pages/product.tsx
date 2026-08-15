"use client";

import {
  PricingTable,
  Protect,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth
} from "@clerk/nextjs";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import Head from "next/head";
import DatePicker from "react-datepicker";
import {
  CalendarDays,
  Clipboard,
  FileText,
  Loader2,
  LogIn,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserRound
} from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

function formatVisitDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function SubscriptionFallback() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 md:px-8 lg:px-10">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-ocean text-white">
            <Stethoscope size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-normal text-ink">MediNotes Pro</h1>
            <p className="text-sm font-medium text-ink/58">Healthcare professional plan</p>
          </div>
        </div>
        <UserButton showName afterSignOutUrl="/" />
      </div>

      <div className="mx-auto w-full max-w-4xl text-center">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-md bg-mint text-ink">
          <ShieldCheck size={26} aria-hidden="true" />
        </div>
        <h2 className="text-4xl font-black tracking-normal text-ink md:text-5xl">
          Healthcare Professional Plan
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-ink/64 md:text-lg">
          Streamline patient consultations with AI-powered summaries, action items, and patient communications.
        </p>

        <div className="mt-10 rounded-lg border border-ink/10 bg-white/86 p-4 shadow-panel backdrop-blur">
          <PricingTable />
        </div>
      </div>
    </section>
  );
}

function ConsultationForm() {
  const { getToken } = useAuth();
  const [patientName, setPatientName] = useState("");
  const [visitDate, setVisitDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const canSubmit = useMemo(
    () => patientName.trim().length > 0 && Boolean(visitDate) && notes.trim().length > 0 && !loading,
    [loading, notes, patientName, visitDate]
  );
  const canCopy = output.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    let buffer = "";

    setOutput("");
    setCopied(false);
    setErrorMessage("");
    setLoading(true);

    try {
      const jwt = await getToken();

      if (!jwt) {
        setErrorMessage("Authentication required.");
        setLoading(false);
        return;
      }

      await fetchEventSource("/api/consultation", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({
          patient_name: patientName,
          date_of_visit: formatVisitDate(visitDate),
          notes
        }),
        onmessage(message) {
          if (message.event === "done") {
            setLoading(false);
            controller.abort();
            return;
          }

          try {
            buffer += JSON.parse(message.data) as string;
          } catch {
            buffer += message.data;
          }
          setOutput(buffer);
        },
        onopen(response) {
          if (!response.ok) {
            throw new Error(`The API responded with HTTP ${response.status}.`);
          }
          return Promise.resolve();
        },
        onclose() {
          setLoading(false);
        },
        onerror(error) {
          throw error;
        }
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorMessage(error instanceof Error ? error.message : "Unable to generate the consultation summary.");
      setLoading(false);
    }
  }

  async function copyOutput() {
    if (!canCopy) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-6 md:grid-cols-[390px_1fr] md:px-8 lg:px-10">
      <aside className="flex flex-col justify-between rounded-lg border border-ink/10 bg-white/90 p-5 shadow-panel backdrop-blur md:sticky md:top-6 md:max-h-[calc(100vh-3rem)]">
        <div>
          <div className="mb-7 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ocean text-white">
                <Stethoscope size={22} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-normal text-ink">MediNotes Pro</h1>
                <p className="text-sm font-medium text-ink/58">Consultation assistant</p>
              </div>
            </div>
            <UserButton showName afterSignOutUrl="/" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
                <UserRound size={16} aria-hidden="true" />
                Patient Name
              </span>
              <input
                className="h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                placeholder="Jane Smith"
                required
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
                <CalendarDays size={16} aria-hidden="true" />
                Date of Visit
              </span>
              <DatePicker
                className="h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                dateFormat="yyyy-MM-dd"
                id="visit-date"
                onChange={(date: Date | null) => setVisitDate(date)}
                placeholderText="Select date"
                required
                selected={visitDate}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
                <FileText size={16} aria-hidden="true" />
                Consultation Notes
              </span>
              <textarea
                className="min-h-44 w-full resize-y rounded-md border border-ink/15 bg-paper px-3 py-3 text-sm leading-6 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                placeholder="Persistent cough for 2 weeks. No fever. Chest clear on examination..."
                required
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#195f6d] disabled:cursor-not-allowed disabled:opacity-65"
              disabled={!canSubmit}
              type="submit"
            >
              {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />}
              {loading ? "Generating summary" : "Generate summary"}
            </button>
          </form>
        </div>

        <div className="mt-8 border-t border-ink/10 pt-5 text-xs font-medium leading-5 text-ink/55">
          Demonstration tool only. Do not use for diagnosis, treatment decisions, or storing protected health information.
        </div>
      </aside>

      <section className="flex min-h-[calc(100vh-3rem)] flex-col rounded-lg border border-ink/10 bg-white/84 shadow-panel backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-mint text-ink">
              <Clipboard size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-black text-ink">Consultation Output</h2>
              <p className="text-sm font-medium text-ink/55">
                {loading ? "Streaming clinical summary" : "Summary, next steps, and patient email"}
              </p>
            </div>
          </div>

          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-bold text-ink transition hover:border-ocean hover:text-ocean disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canCopy}
            onClick={copyOutput}
            type="button"
          >
            <Clipboard size={17} aria-hidden="true" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-6 md:px-8">
          {errorMessage ? (
            <div className="rounded-md border border-coral/40 bg-coral/10 p-4 text-sm font-semibold text-ink">
              {errorMessage}
            </div>
          ) : output ? (
            <article className="markdown-content max-w-3xl text-[15px] leading-7 text-ink/82">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{output}</ReactMarkdown>
            </article>
          ) : (
            <div className="flex h-full min-h-80 items-center justify-center">
              <div className="flex max-w-md items-center gap-3 rounded-md border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink/60">
                {loading ? <Loader2 className="animate-spin text-ocean" size={18} aria-hidden="true" /> : <Stethoscope className="text-ocean" size={18} aria-hidden="true" />}
                Enter consultation notes to generate a record summary, action items, and patient-friendly email.
              </div>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default function Product() {
  return (
    <>
      <Head>
        <title>MediNotes Pro | Consultation Assistant</title>
      </Head>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#b8f2d0_0,#f7f4ee_34%,#ffffff_100%)]">
        <SignedOut>
          <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-6 grid h-14 w-14 place-items-center rounded-md bg-ocean text-white">
              <Stethoscope size={26} aria-hidden="true" />
            </div>
            <h1 className="text-4xl font-black tracking-normal text-ink md:text-5xl">MediNotes Pro</h1>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-ink/64 md:text-lg">
              Sign in to choose your plan and access the consultation assistant.
            </p>
            <SignInButton mode="modal">
              <button className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ocean px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#195f6d]">
                <LogIn size={18} aria-hidden="true" />
                Sign in
              </button>
            </SignInButton>
          </section>
        </SignedOut>

        <SignedIn>
          <Protect plan="premium_subscription" fallback={<SubscriptionFallback />}>
            <ConsultationForm />
          </Protect>
        </SignedIn>
      </main>
    </>
  );
}
