"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Check, LogIn, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <>
      <Head>
        <title>IdeaForge AI</title>
      </Head>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#b8f2d0_0,#f7f4ee_34%,#ffffff_100%)]">
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 md:px-8 lg:px-10">
          <nav className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3" href="/">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white">
                <Sparkles size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-2xl font-black tracking-normal text-ink">IdeaForge AI</span>
                <span className="block text-sm font-medium text-ink/58">Premium SaaS concepts</span>
              </span>
            </Link>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-bold text-ink transition hover:border-ocean hover:text-ocean">
                  <LogIn size={17} aria-hidden="true" />
                  Iniciar sesion
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#eb6545]"
                  href="/product"
                >
                  Abrir app
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <UserButton showName afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[minmax(0,0.95fr)_minmax(360px,1fr)]">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-black leading-[1.02] tracking-normal text-ink md:text-7xl">
                IdeaForge AI
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-ink/66">
                Genera oportunidades SaaS con IA, ajusta audiencia, industria y restricciones, y recibe una propuesta estructurada en Markdown.
              </p>

              <div className="mt-7 w-full max-w-sm rounded-lg border border-ink/10 bg-white/86 p-5 shadow-panel backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-ink">Premium Subscription</h2>
                    <p className="mt-1 text-sm font-medium text-ink/56">Ideas ilimitadas para builders.</p>
                  </div>
                  <div className="rounded-md bg-mint px-3 py-1 text-xs font-black text-ink">PRO</div>
                </div>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-black text-ink">$10</span>
                  <span className="pb-1 text-sm font-bold text-ink/50">/mes</span>
                </div>

                <ul className="mt-5 space-y-3 text-sm font-semibold text-ink/70">
                  {["Generacion ilimitada", "Modelos avanzados de IA", "Soporte prioritario"].map((feature) => (
                    <li className="flex items-center gap-2" key={feature}>
                      <Check className="text-ocean" size={17} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-coral px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#eb6545]">
                      <LogIn size={18} aria-hidden="true" />
                      Probar premium
                    </button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <Link
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-coral px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#eb6545]"
                    href="/product"
                  >
                    Acceder a premium
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </SignedIn>
              </div>
            </div>

            <div className="rounded-lg border border-ink/10 bg-white/86 p-5 shadow-panel backdrop-blur">
              <div className="mb-4 flex items-center justify-between border-b border-ink/10 pb-4">
                <div>
                  <h2 className="text-lg font-black text-ink">Vista del producto</h2>
                  <p className="text-sm font-medium text-ink/55">Protegido con Clerk Billing</p>
                </div>
                <div className="rounded-md bg-mint px-3 py-1 text-xs font-black text-ink">PRO</div>
              </div>

              <div className="space-y-3">
                {["Audiencia", "Industria", "Restriccion"].map((label) => (
                  <div key={label}>
                    <div className="mb-2 text-xs font-black uppercase text-ink/45">{label}</div>
                    <div className="h-11 rounded-md border border-ink/10 bg-paper" />
                  </div>
                ))}
                <div className="rounded-md border border-ink/10 bg-paper p-4">
                  <div className="mb-3 h-4 w-2/3 rounded-sm bg-ink/16" />
                  <div className="space-y-2">
                    <div className="h-3 rounded-sm bg-ink/10" />
                    <div className="h-3 w-5/6 rounded-sm bg-ink/10" />
                    <div className="h-3 w-4/6 rounded-sm bg-ink/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
