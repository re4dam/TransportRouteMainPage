"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ToastClient";

export default function RouteActions({ routeId }: { routeId: number }) {
  const router = useRouter();
  const [canArchive, setCanArchive] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Safe to use localStorage here because this is a client component
    const checkLoginState = localStorage.getItem('isLoggedIn') === 'true';
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    const hasPermission = userRoles.includes('SuperAdmin') || userRoles.includes('RouteManager');
    setIsLoggedIn(checkLoginState);
    setCanArchive(hasPermission);
  }, []);

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this route? You can restore it later from Archives.")) {
      return;
    }

    setIsArchiving(true);

    const token = sessionStorage.getItem('csrf_token');

    try {
      await apiFetch(`/TransitRoutes/${routeId}/archive`, {
        method: "PATCH",
        headers: {
          "X-CSRF-TOKEN": token || ""
        },
        credentials: "include"
      });

      showToast("Route archived successfully!", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast("An error occurred while archiving the route.", "error");
      setIsArchiving(false);
    }
  };

  return (
    <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
      {isLoggedIn && (
        <Link 
          href={`/routes/edit/${routeId}`}
          className="p-2.5 rounded-xl text-amber-500 bg-amber-50 hover:bg-amber-500 hover:text-white transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-amber-400 focus:outline-none"
          aria-label="Edit route"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
      )}

      {canArchive && (
        <button 
          onClick={handleArchive}
          disabled={isArchiving}
          className={`p-2.5 rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none ${
            isArchiving 
              ? "text-slate-400 bg-slate-100 cursor-wait" 
              : "text-sky-600 bg-sky-50 hover:bg-sky-600 hover:text-white hover:shadow-md"
          }`}
          aria-label="Archive route"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M7 8V6a1 1 0 011-1h8a1 1 0 011 1v2m-9 4h8m-8 3h8m-9 4h10a2 2 0 002-2V8H5v9a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}