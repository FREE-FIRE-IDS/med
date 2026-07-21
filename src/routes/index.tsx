import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Sparkles,
  Search,
  Moon,
  Sun,
  Pill,
  Beaker,
  Layers,
  Activity,
  ShieldAlert,
  Stethoscope,
  Ban,
  AlertTriangle,
  Baby,
  FlaskConical,
  Loader2,
} from "lucide-react";
import { analyzeMedicine, type MedicineAnalysis } from "@/lib/analyze-medicine.functions";
import { suggestMedicines } from "@/lib/suggest-medicines.functions";
import { SplashScreen } from "@/components/SplashScreen";

type Language = "english" | "urdu" | "roman_urdu";

const LABELS: Record<Language, {
  title: string; tagline: string; placeholder: string; analyze: string; analyzing: string;
  empty: string; theme: string; language: string; disclaimer: string;
  fields: Record<keyof MedicineAnalysis, string>;
}> = {
  english: {
    title: "PHARM AI",
    tagline: "Your futuristic AI pharmacology companion",
    placeholder: "Enter medicine name (e.g. Diclofenac, Panadol)…",
    analyze: "Analyze",
    analyzing: "Analyzing…",
    empty: "Enter a medicine name above and let the AI decode it.",
    theme: "Theme",
    language: "Language",
    disclaimer: "Educational information only — not a substitute for medical advice.",
    fields: {
      generic_name: "Generic Name",
      brand_names: "Brand Names",
      drug_class: "Drug Class",
      dose: "Dose / Strength",
      forms: "Available Forms",
      mechanism_of_action: "Mechanism of Action",
      indications: "Indications",
      contraindications: "Contraindications",
      side_effects: "Side Effects",
      age_recommendation: "Age Recommendation",
      uses: "Uses",
      warning: "Warning",
    },
  },
  urdu: {
    title: "فارم اے آئی",
    tagline: "آپ کا مستقبل کا AI فارماکولوجی معاون",
    placeholder: "دوا کا نام لکھیں (مثلاً ڈیکلوفینک، پیناڈول)…",
    analyze: "تجزیہ کریں",
    analyzing: "تجزیہ ہو رہا ہے…",
    empty: "اوپر دوا کا نام لکھیں اور AI کو تجزیہ کرنے دیں۔",
    theme: "تھیم",
    language: "زبان",
    disclaimer: "صرف تعلیمی معلومات — یہ ڈاکٹر کے مشورے کا متبادل نہیں۔",
    fields: {
      generic_name: "جنرک نام",
      brand_names: "برانڈ ناموں",
      drug_class: "دوا کی کلاس",
      dose: "خوراک / طاقت",
      forms: "دستیاب اقسام",
      mechanism_of_action: "عمل کا طریقہ",
      indications: "استعمال کے مواقع",
      contraindications: "ممنوعات",
      side_effects: "مضر اثرات",
      age_recommendation: "عمر کی تجویز",
      uses: "استعمالات",
      warning: "انتباہ",
    },
  },
  roman_urdu: {
    title: "PHARM AI",
    tagline: "Aap ka futuristic AI pharmacology saathi",
    placeholder: "Medicine ka naam likhein (misaal: Diclofenac, Panadol)…",
    analyze: "Analyze karein",
    analyzing: "Analyze ho raha hai…",
    empty: "Upar medicine ka naam likhein aur AI ko analyze karne dein.",
    theme: "Theme",
    language: "Zubaan",
    disclaimer: "Sirf taleemi maloomat — doctor ke mashwaray ka mutabadil nahi.",
    fields: {
      generic_name: "Generic Naam",
      brand_names: "Brand Naam",
      drug_class: "Drug Class",
      dose: "Dose / Strength",
      forms: "Available Forms",
      mechanism_of_action: "Mechanism of Action",
      indications: "Indications",
      contraindications: "Contraindications",
      side_effects: "Side Effects",
      age_recommendation: "Umar ki tajweez",
      uses: "Uses",
      warning: "Warning",
    },
  },
};

const FIELD_ICONS: Record<string, typeof Pill> = {
  generic_name: Pill,
  brand_names: Beaker,
  drug_class: Layers,
  dose: FlaskConical,
  forms: Layers,
  mechanism_of_action: Activity,
  indications: Stethoscope,
  contraindications: Ban,
  side_effects: ShieldAlert,
  age_recommendation: Baby,
  uses: Sparkles,
  warning: AlertTriangle,
};

const FIELD_ORDER: (keyof MedicineAnalysis)[] = [
  "generic_name",
  "brand_names",
  "drug_class",
  "dose",
  "forms",
  "mechanism_of_action",
  "indications",
  "contraindications",
  "side_effects",
  "age_recommendation",
  "uses",
  "warning",
];

export const Route = createFileRoute("/")({
  component: PharmAI,
});

function PharmAI() {
  const [showSplash, setShowSplash] = useState(true);
  const [medicine, setMedicine] = useState("");
  const [language, setLanguage] = useState<Language>("english");
  const [dark, setDark] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestSeq = useRef(0);
  const t = LABELS[language];
  const isRTL = language === "urdu";

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("pharm-theme") : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : prefersDark);
    const storedLang = typeof window !== "undefined" ? localStorage.getItem("pharm-lang") : null;
    if (storedLang === "english" || storedLang === "urdu" || storedLang === "roman_urdu") {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("pharm-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("pharm-lang", language);
  }, [language]);

  // AI-powered debounced suggestions
  useEffect(() => {
    const q = medicine.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const mySeq = ++suggestSeq.current;
    const timer = setTimeout(async () => {
      try {
        const results = await suggestMedicines({ data: { query: q } });
        if (mySeq === suggestSeq.current) setSuggestions(results);
      } catch {
        if (mySeq === suggestSeq.current) setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [medicine]);

  const mutation = useMutation({
    mutationFn: (payload: { medicine: string; language: Language }) =>
      analyzeMedicine({ data: payload }),
  });

  const runAnalyze = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setShowSuggest(false);
    mutation.mutate({ medicine: trimmed, language });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalyze(medicine);
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      {/* animated backdrop */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-hero opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-hero opacity-30 blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        {/* header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hero shadow-glow animate-pulse-glow">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-black tracking-widest sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="text-gradient">{t.title}</span>
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label={t.language}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium outline-none transition focus:ring-2 focus:ring-ring sm:text-sm"
            >
              <option value="english">English</option>
              <option value="urdu">اردو</option>
              <option value="roman_urdu">Roman Urdu</option>
            </select>
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-label={t.theme}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface transition hover:shadow-neon"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* search */}
        <form onSubmit={submit} className="relative">
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-glow transition focus-within:ring-2 focus-within:ring-ring">
            <div className="flex items-center gap-2 rounded-xl bg-background/40 px-4 py-2">
              <Search className="h-5 w-5 shrink-0 text-primary" />
              <input
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                placeholder={t.placeholder}
                maxLength={120}
                className="w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground sm:text-lg"
              />
              <button
                type="submit"
                disabled={mutation.isPending || !medicine.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-hero px-4 py-2.5 text-sm font-semibold text-white shadow-neon transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {mutation.isPending ? t.analyzing : t.analyze}
                </span>
              </button>
            </div>
          </div>

          {/* suggestions dropdown */}
          {showSuggest && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-glow animate-fade-in">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                AI Recommended
              </div>
              <ul>
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setMedicine(s);
                        runAnalyze(s);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-primary/10"
                    >
                      <Pill className="h-4 w-4 text-primary" />
                      <span>{s}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* error */}
        {mutation.isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {(mutation.error as Error).message}
          </div>
        )}

        {/* results */}
        {mutation.data ? (
          <ResultGrid data={mutation.data} t={t} />
        ) : mutation.isPending ? (
          <SkeletonGrid />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground sm:text-base">{t.empty}</p>
          </div>
        )}

        <footer className="mt-4 text-center text-xs text-muted-foreground">
          {t.disclaimer}
        </footer>
      </div>
    </div>
    </>
  );
}


function ResultGrid({
  data,
  t,
}: {
  data: MedicineAnalysis;
  t: (typeof LABELS)[Language];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {FIELD_ORDER.map((key) => {
        const Icon = FIELD_ICONS[key] ?? Pill;
        const highlight = key === "warning" || key === "contraindications" || key === "side_effects";
        return (
          <div
            key={key}
            className={`group relative overflow-hidden rounded-2xl border p-5 transition hover:shadow-glow ${
              highlight
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-surface"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  highlight ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t.fields[key]}
              </h3>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {data[key]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}
