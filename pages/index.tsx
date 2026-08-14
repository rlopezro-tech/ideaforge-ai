"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, LogIn, Mail, ShieldCheck, Stethoscope } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Professional Summaries",
    body: "Generate consultation summaries structured for medical records."
  },
  {
    icon: ClipboardList,
    title: "Action Items",
    body: "Turn visit notes into clear follow-up steps for the care team."
  },
  {
    icon: Mail,
    title: "Patient Emails",
    body: "Draft concise, patient-friendly communication from clinical notes."
  }
];

export default function Home() {
  return (
    <>
      <Head>
        <title>MediNotes Pro</title>
      </Head>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#b8f2d0_0,#f7f4ee_34%,#ffffff_100%)]">
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 md:px-8 lg:px-10">
          <nav className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3" href="/">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-ocean text-white">
                <Stethoscope size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-2xl font-black tracking-normal text-ink">MediNotes Pro</span>
                <span className="block text-sm font-medium text-ink/58">Consultation assistant</span>
              </span>
            </Link>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-bold text-ink transition hover:border-ocean hover:text-ocean">
                  <LogIn size={17} aria-hidden="true" />
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#195f6d]"
                  href="/product"
                >
                  Open app
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <UserButton showName afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(360px,1fr)]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-ocean/20 bg-white/80 px-3 py-2 text-sm font-black text-ocean">
                <ShieldCheck size={16} aria-hidden="true" />
                Demonstration healthcare workflow
              </div>
              <h1 className="text-5xl font-black leading-[1.02] tracking-normal text-ink md:text-7xl">
                MediNotes Pro
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-ink/66">
                Transform consultation notes into professional summaries, doctor action items, and patient-friendly emails.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ocean px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#195f6d]">
                      <LogIn size={18} aria-hidden="true" />
                      Start trial
                    </button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <Link
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ocean px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#195f6d]"
                    href="/product"
                  >
                    Open consultation assistant
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </SignedIn>
              </div>

              <p className="mt-6 text-sm font-semibold text-ink/48">For demonstration purposes only.</p>
            </div>

            <div className="grid gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div className="rounded-lg border border-ink/10 bg-white/86 p-5 shadow-panel backdrop-blur" key={feature.title}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-md bg-mint text-ink">
                        <Icon size={20} aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-black text-ink">{feature.title}</h2>
                    </div>
                    <p className="text-sm font-medium leading-6 text-ink/62">{feature.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
