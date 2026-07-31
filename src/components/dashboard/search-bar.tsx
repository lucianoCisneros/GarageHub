"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  // Convert to string for a stable primitive dependency (avoids infinite loop
  // caused by useSearchParams() returning a new object reference on every render)
  const searchParamsString = searchParams.toString();

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsString);
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      const newUrl = `${pathname}?${params.toString()}`;
      const currentUrl = `${pathname}?${searchParamsString}`;

      // Only navigate if the URL actually changed to prevent infinite re-render loop
      if (newUrl !== currentUrl) {
        router.push(newUrl);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParamsString]);

  const clear = useCallback(() => {
    setValue("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 pointer-events-none" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscá por nombre, modelo o patente..."
        className="h-14 pl-12 pr-12 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-base rounded-xl focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-4 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 active:scale-90 transition-all rounded-full hover:bg-zinc-800"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}