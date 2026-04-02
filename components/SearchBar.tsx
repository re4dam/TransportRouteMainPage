"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder = "Search..." }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize the input with the current keyword from the URL if it exists
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
      params.set("page", "1"); // Reset to first page on search
    } else {
      params.delete("keyword");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center shadow-sm">
      <input
        type="text"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="px-4 py-2 w-48 md:w-64 border border-slate-200 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
      />
      <button 
        type="submit"
        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-r-md border border-l-0 border-slate-200 hover:bg-indigo-100 font-bold text-sm transition-colors"
      >
        Search
      </button>
    </form>
  );
}