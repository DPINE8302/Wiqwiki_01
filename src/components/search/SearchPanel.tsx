import { useEffect, useMemo, useRef, useState } from "react";

import { create, load, search, type Orama, type RawData } from "@orama/orama";

type QuickLink = {
  label: string;
  href: string;
  badge?: string;
};

type SearchDocument = {
  id: string;
  type: string;
  title: string;
  description: string;
  route: string;
  badges: string[];
  keywords: string[];
};

type SearchResultHit = Pick<SearchDocument, "id" | "type" | "title" | "description" | "route" | "badges">;

type SearchManifest = {
  generatedAt: string;
  documents: number;
};

interface SearchPanelProps {
  quicklinks: QuickLink[];
  suggestions: string[];
}

const schema = {
  id: "string",
  type: "string",
  title: "string",
  description: "string",
  route: "string",
  badges: "string[]",
  keywords: "string[]"
} as const;

type SearchSchema = typeof schema;
type SearchInstance = Orama<SearchSchema>;

const formatTimestamp = (input: string | null) => {
  if (!input) {
    return "";
  }
  try {
    const date = new Date(input);
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  } catch {
    return "";
  }
};

export function SearchPanel({ quicklinks, suggestions }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultHit[]>([]);
  const [manifest, setManifest] = useState<SearchManifest | null>(null);
  const databaseRef = useRef<SearchInstance | null>(null);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) {
      return suggestions.slice(0, 6);
    }
    const lower = query.toLowerCase();
    return suggestions.filter((item) => item.toLowerCase().includes(lower)).slice(0, 6);
  }, [query, suggestions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const trimmed = query.trim();
    if (trimmed) {
      url.searchParams.set("q", trimmed);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSearch = async () => {
      try {
        setStatus("loading");
        const db = create({ schema });
        const response = await fetch("/search-index.json", { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`Search index fetch failed (${response.status})`);
        }
        const raw = (await response.json()) as RawData;
        await load(db, raw);

        if (cancelled) {
          return;
        }

        databaseRef.current = db;
        setStatus("ready");

        const manifestResponse = await fetch("/search-manifest.json", { cache: "force-cache" });
        if (manifestResponse.ok) {
          const manifestJson = (await manifestResponse.json()) as SearchManifest;
          if (!cancelled) {
            setManifest(manifestJson);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to bootstrap search", error);
          setStatus("error");
        }
      }
    };

    bootstrapSearch();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (status !== "ready") {
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const db = databaseRef.current;
        if (!db) {
          return;
        }

        const response = await search(db, {
          term: trimmed,
          limit: 8,
          properties: ["title", "description", "keywords"]
        });

        if (cancelled) {
          return;
        }

        const hits = response.hits ?? [];
        setResults(
          hits.map((hit) => ({
            id: hit.document.id,
            title: hit.document.title,
            description: hit.document.description,
            route: hit.document.route,
            type: hit.document.type,
            badges: hit.document.badges ?? []
          }))
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Search query failed", error);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query, status]);

  const hasQuery = query.trim().length > 0;
  const indexInfo = manifest ? `${manifest.documents} docs · ${formatTimestamp(manifest.generatedAt)}` : null;

  return (
    <div className="glass-panel border border-white/10 px-6 pb-8 pt-5">
      <form
        className="flex flex-col gap-4"
        role="search"
        aria-label="Global search"
        onSubmit={(event) => {
          event.preventDefault();
          if (results.length > 0) {
            window.location.href = results[0].route;
          }
        }}
      >
        <label htmlFor="global-search-input" className="sr-only">
          Search Wiqnnc_'s Wiki
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(8,18,34,0.72)] px-4 py-3">
            <span className="text-sm text-white/40">⌘K</span>
            <input
              id="global-search-input"
              className="w-full bg-transparent text-lg font-medium text-white placeholder:text-white/30 focus:outline-none"
              placeholder="Search projects, awards, media, facts..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs uppercase tracking-[0.3em] text-white/40 hover:text-white focus:outline-none"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/40">
            <span>Offline index · instant results</span>
            {indexInfo ? <span className="hidden sm:inline-flex">{indexInfo}</span> : null}
          </div>
        </div>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.35em] text-white/40">
            Suggestions
          </span>
          <ul className="flex flex-wrap gap-2">
            {filteredSuggestions.map((entry) => (
              <li key={entry}>
                <button
                  type="button"
                  onClick={() => setQuery(entry)}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  {entry}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.35em] text-white/40">
            Quick Links
          </span>
          <ul className="flex flex-col gap-2 text-sm text-white/70">
            {quicklinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:text-white"
                >
                  <span>{link.label}</span>
                  {link.badge ? (
                    <span className="rounded border border-white/30 px-2 py-1 text-xs uppercase tracking-[0.3em] text-white/50">
                      {link.badge}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.35em] text-white/40">Results</span>
          {status === "loading" ? (
            <span className="text-xs uppercase tracking-[0.35em] text-white/40">Index loading…</span>
          ) : null}
          {status === "error" ? (
            <span className="text-xs uppercase tracking-[0.35em] text-[#a3485a]">
              Index unavailable
            </span>
          ) : null}
          {status === "ready" && indexInfo ? (
            <span className="text-xs uppercase tracking-[0.35em] text-white/30 sm:hidden">
              {indexInfo}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {!hasQuery ? (
            <p className="text-sm text-white/50">
              Start typing to surface biography facts, awards, repositories, and media deep
              links instantly.
            </p>
          ) : null}
          {hasQuery && isSearching ? (
            <p className="text-sm text-white/50">Searching…</p>
          ) : null}
          {hasQuery && !isSearching && results.length === 0 && status === "ready" ? (
            <p className="text-sm text-white/50">No matches yet. Try a broader phrase.</p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {results.map((result) => (
              <li key={result.id}>
                <a
                  href={result.route}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:text-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-white">{result.title}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                      {result.type}
                    </span>
                  </div>
                  <p className="text-sm text-white/70">{result.description}</p>
                  {result.badges.length ? (
                    <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                      {result.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded border border-white/20 px-2 py-1 text-white/50"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;
