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
import { Clipboard, CreditCard, Lightbulb, Loader2, LogIn, RefreshCw, Sparkles } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type FormState = {
  audience: string;
  industry: string;
  constraint: string;
  language: string;
};

const initialForm: FormState = {
  audience: "fundadores no tecnicos",
  industry: "automatizacion para negocios locales",
  constraint: "validable en 14 dias",
  language: "espanol"
};

function buildUrl(form: FormState) {
  const params = new URLSearchParams(form);
  return `/api?${params.toString()}`;
}

function SubscriptionFallback() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 md:px-8 lg:px-10">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white">
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-normal text-ink">IdeaForge AI</h1>
            <p className="text-sm font-medium text-ink/58">Premium access</p>
          </div>
        </div>
        <UserButton showName afterSignOutUrl="/" />
      </div>

      <div className="mx-auto w-full max-w-4xl text-center">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-md bg-mint text-ink">
          <CreditCard size={26} aria-hidden="true" />
        </div>
        <h2 className="text-4xl font-black tracking-normal text-ink md:text-5xl">Elige tu plan</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-ink/64 md:text-lg">
          Desbloquea generacion ilimitada de ideas SaaS con IA y acceso completo al producto.
        </p>

        <div className="mt-10 rounded-lg border border-ink/10 bg-white/86 p-4 shadow-panel backdrop-blur">
          <PricingTable />
        </div>
      </div>
    </section>
  );
}

function IdeaGenerator() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const canCopy = useMemo(() => idea.trim().length > 0, [idea]);

  const generateIdea = useCallback(
    async (nextForm: FormState) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIdea("");
      setCopied(false);
      setErrorMessage("");
      setStatus("loading");

      try {
        const jwt = await getToken();

        if (!jwt) {
          setStatus("error");
          setErrorMessage("Inicia sesion para generar ideas.");
          return;
        }

        let buffer = "";

        await fetchEventSource(buildUrl(nextForm), {
          headers: { Authorization: `Bearer ${jwt}` },
          signal: controller.signal,
          onmessage(event) {
            if (event.event === "done") {
              setStatus("done");
              controller.abort();
              return;
            }

            try {
              buffer += JSON.parse(event.data) as string;
            } catch {
              buffer += event.data;
            }
            setIdea(buffer);
          },
          onopen(response) {
            if (!response.ok) {
              throw new Error(`La API respondio con HTTP ${response.status}`);
            }
            return Promise.resolve();
          },
          onerror(error) {
            throw error;
          }
        });

        setStatus("done");
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "No se pudo conectar con el generador.");
      }
    },
    [getToken]
  );

  useEffect(() => {
    if (isLoaded && isSignedIn && status === "idle") {
      queueMicrotask(() => void generateIdea(initialForm));
    }

    return () => abortRef.current?.abort();
  }, [generateIdea, isLoaded, isSignedIn, status]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void generateIdea(form);
  };

  const copyIdea = async () => {
    if (!canCopy) return;
    await navigator.clipboard.writeText(idea);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-6 md:grid-cols-[360px_1fr] md:px-8 lg:px-10">
      <aside className="flex flex-col justify-between rounded-lg border border-ink/10 bg-white/88 p-5 shadow-panel backdrop-blur md:sticky md:top-6 md:max-h-[calc(100vh-3rem)]">
        <div>
          <div className="mb-7 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ink text-white">
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-normal text-ink">IdeaForge AI</h1>
                <p className="text-sm font-medium text-ink/58">Premium SaaS concepts</p>
              </div>
            </div>
            <UserButton showName afterSignOutUrl="/" />
          </div>

          <form className="space-y-5" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink">Audiencia</span>
              <input
                className="h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                value={form.audience}
                onChange={(event) => setForm({ ...form, audience: event.target.value })}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink">Industria</span>
              <input
                className="h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                value={form.industry}
                onChange={(event) => setForm({ ...form, industry: event.target.value })}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink">Restriccion</span>
              <input
                className="h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                value={form.constraint}
                onChange={(event) => setForm({ ...form, constraint: event.target.value })}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink">Idioma</span>
              <select
                className="h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                value={form.language}
                onChange={(event) => setForm({ ...form, language: event.target.value })}
              >
                <option value="espanol">Espanol</option>
                <option value="english">English</option>
              </select>
            </label>

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#eb6545] disabled:cursor-not-allowed disabled:opacity-65"
              disabled={!isLoaded || !isSignedIn || status === "loading"}
              type="submit"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <RefreshCw size={18} aria-hidden="true" />
              )}
              Generar idea
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-ink/10 pt-5 text-center">
          <div>
            <div className="text-lg font-black text-ink">JWT</div>
            <div className="text-xs font-semibold text-ink/50">auth</div>
          </div>
          <div>
            <div className="text-lg font-black text-ink">PRO</div>
            <div className="text-xs font-semibold text-ink/50">billing</div>
          </div>
          <div>
            <div className="text-lg font-black text-ink">API</div>
            <div className="text-xs font-semibold text-ink/50">FastAPI</div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-[calc(100vh-3rem)] flex-col rounded-lg border border-ink/10 bg-white/82 shadow-panel backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-mint text-ink">
              <Lightbulb size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-black text-ink">Nueva oportunidad</h2>
              <p className="text-sm font-medium text-ink/55">
                {status === "loading" ? "Generando en tiempo real" : "Lista para iterar"}
              </p>
            </div>
          </div>

          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-bold text-ink transition hover:border-ocean hover:text-ocean disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canCopy}
            onClick={copyIdea}
            type="button"
          >
            <Clipboard size={17} aria-hidden="true" />
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-6 md:px-8">
          {status === "error" ? (
            <div className="rounded-md border border-coral/40 bg-coral/10 p-4 text-sm font-semibold text-ink">
              {errorMessage || "No se pudo conectar con el generador."}
            </div>
          ) : idea ? (
            <article className="markdown-content max-w-3xl text-[15px] leading-7 text-ink/82">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{idea}</ReactMarkdown>
            </article>
          ) : (
            <div className="flex h-full min-h-80 items-center justify-center">
              <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink/60">
                {status === "loading" ? (
                  <Loader2 className="animate-spin text-ocean" size={18} aria-hidden="true" />
                ) : (
                  <Sparkles className="text-ocean" size={18} aria-hidden="true" />
                )}
                {status === "loading" ? "Preparando concepto" : "Ajusta los campos y genera una idea"}
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
        <title>IdeaForge AI | Premium</title>
      </Head>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#b8f2d0_0,#f7f4ee_34%,#ffffff_100%)]">
        <SignedOut>
          <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-6 grid h-14 w-14 place-items-center rounded-md bg-ink text-white">
              <Sparkles size={26} aria-hidden="true" />
            </div>
            <h1 className="text-4xl font-black tracking-normal text-ink md:text-5xl">IdeaForge AI</h1>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-ink/64 md:text-lg">
              Inicia sesion para elegir tu plan y acceder al generador premium.
            </p>
            <SignInButton mode="modal">
              <button className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-coral px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#eb6545]">
                <LogIn size={18} aria-hidden="true" />
                Iniciar sesion
              </button>
            </SignInButton>
          </section>
        </SignedOut>

        <SignedIn>
          <Protect plan="premium_subscription" fallback={<SubscriptionFallback />}>
            <IdeaGenerator />
          </Protect>
        </SignedIn>
      </main>
    </>
  );
}
