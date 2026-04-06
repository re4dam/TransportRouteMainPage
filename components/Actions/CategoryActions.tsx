'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';
import Link from 'next/link';
import { useToast } from '@/components/ToastClient';

export default function CategoryActions({ id, categoryName }: { id: number, categoryName: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [canArchive, setCanArchive] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();
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
    const confirmed = window.confirm(`Are you sure you want to archive the "${categoryName}" category?\n\nYou can restore it later from Archives.`);
    if (!confirmed) return;

    setIsArchiving(true);
    const token = sessionStorage.getItem('csrf_token');
    
    try {
      await apiFetch(`/Category/${id}/archive`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-CSRF-Token': token || '' }
      });

      showToast('Category archived successfully!', 'success');
      // Success! This tells the Next.js Server Component to instantly re-fetch the data!
      router.refresh(); 
      
    } catch (err: any) {
      showToast(err?.message || 'Failed to archive category.', 'error');
      setIsArchiving(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
      {isLoggedIn && (
        <Link 
          href={`/categories/edit/${id}`} 
          className="flex-1 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-center"
        >
          Edit
        </Link>
      )}
      {canArchive && (
        <button
          onClick={handleArchive}
          disabled={isArchiving}
          className="flex-1 px-4 py-2 bg-sky-50 border border-sky-200 rounded-lg text-sm font-bold text-sky-700 hover:bg-sky-100 hover:border-sky-300 transition-all disabled:opacity-50"
        >
          {isArchiving ? 'Archiving...' : 'Archive'}
        </button>
      )}
    </div>
  );
}