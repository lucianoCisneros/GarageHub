"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpDown } from "lucide-react";
import type { SortBy, SortOrder } from "@/types";

interface SortOption {
  label: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

const SORT_OPTIONS: SortOption[] = [
  { label: "Marca (A-Z)", sortBy: "brand", sortOrder: "asc" },
  { label: "Marca (Z-A)", sortBy: "brand", sortOrder: "desc" },
  { label: "Último servicio (nuevo)", sortBy: "lastService", sortOrder: "desc" },
  { label: "Último servicio (antiguo)", sortBy: "lastService", sortOrder: "asc" },
];

export function SortControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy = (searchParams.get("sortBy") as SortBy) ?? "brand";
  const currentSortOrder = (searchParams.get("sortOrder") as SortOrder) ?? "asc";

  // Find the current value for the select
  const currentValue = SORT_OPTIONS.find(
    (o) => o.sortBy === currentSortBy && o.sortOrder === currentSortOrder,
  );
  const selectValue = currentValue
    ? `${currentValue.sortBy}:${currentValue.sortOrder}`
    : "brand:asc";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [sortBy, sortOrder] = e.target.value.split(":") as [SortBy, SortOrder];
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative">
      <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
      <select
        value={selectValue}
        onChange={handleChange}
        className="h-10 pl-10 pr-4 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-xl
          focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50
          appearance-none cursor-pointer hover:border-zinc-700 transition-colors
          [&>option]:bg-zinc-900 [&>option]:text-zinc-300"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={`${option.sortBy}:${option.sortOrder}`}
            value={`${option.sortBy}:${option.sortOrder}`}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}