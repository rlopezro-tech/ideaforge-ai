"use client";

import Head from "next/head";
import { Clipboard, Lightbulb, Loader2, RefreshCw, Sparkles } from "lucide-react";
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

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const eventRef = useRef<EventSource | null>(null);

  const canCopy = useMemo(() => idea.trim().length > 0, [idea]);

  const generateIdea = useCallback((nextForm: FormState) => {
    eventRef.current?.close();
    setIdea("");
    setCopied(false);
    setStatus("loading");

    const source = new EventSource(buildUrl(nextForm));
    eventRef.current = source;
    let buffer = "";

    source.onmessage = (event) => {
      try {
        buffer += JSON.parse(event.data) as string;
      } catch {
        buffer += event.data;
      }
      setIdea(buffer);
    };

    source.addEventListener("done", () => {
      setStatus("done");
      source.close();
    });

    source.onerror = () => {
      if (buffer.trim().length === 0) {
        setStatus("error");
      }
      source.close();
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => generateIdea(initialForm));
    return () => eventRef.current?.close();
  }, [generateIdea]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generateIdea(form);
  };

  const copyIdea = async () => {
    if (!canCopy) return;
    await navigator.clipboard.writeText(idea);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Head>
        <title>IdeaForge AI</title>
      </Head>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#b8f2d0_0,#f7f4ee_34%,#ffffff_100%)]">
        <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-6 md:grid-cols-[360px_1fr] md:px-8 lg:px-10">
          <aside className="flex flex-col justify-between rounded-lg border border-ink/10 bg-white/88 p-5 shadow-panel backdrop-blur md:sticky md:top-6 md:max-h-[calc(100vh-3rem)]">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white">
                  <Sparkles size={22} aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-normal text-ink">IdeaForge AI</h1>
                  <p className="text-sm font-medium text-ink/58">SaaS concepts, streamed</p>
                </div>
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
                  disabled={status === "loading"}
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
                <div className="text-lg font-black text-ink">SSE</div>
                <div className="text-xs font-semibold text-ink/50">stream</div>
              </div>
              <div>
                <div className="text-lg font-black text-ink">MD</div>
                <div className="text-xs font-semibold text-ink/50">format</div>
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
                  No se pudo conectar con el generador. Revisa la ruta API o la variable OPENAI_API_KEY.
                </div>
              ) : idea ? (
                <article className="markdown-content max-w-3xl text-[15px] leading-7 text-ink/82">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{idea}</ReactMarkdown>
                </article>
              ) : (
                <div className="flex h-full min-h-80 items-center justify-center">
                  <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-ink/60">
                    <Loader2 className="animate-spin text-ocean" size={18} aria-hidden="true" />
                    Preparando concepto
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
