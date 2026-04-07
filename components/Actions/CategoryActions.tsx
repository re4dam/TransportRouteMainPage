'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';
import Link from 'next/link';
import { useToast } from '@/components/ToastClient';
import { createPortal } from 'react-dom';

interface CategoryActionsProps {
  id: number;
  categoryName: string;
  description?: string;
  displayColor?: string;
  vehicleCount?: number;
}

export default function CategoryActions({ 
  id, 
  categoryName, 
  description, 
  displayColor = '#9CA3AF', // Default gray if missing
  vehicleCount = 0 
}: CategoryActionsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [canArchive, setCanArchive] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    
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
    <>
      <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="uppercase tracking-wide">Display Color</span>
          <span
            className="w-4 h-4 rounded-full border border-slate-300 shadow-sm"
            style={{ backgroundColor: displayColor }}
            aria-label={`Category color ${displayColor}`}
          />
          <span className="font-mono text-slate-500">{displayColor.toUpperCase()}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all text-center"
          >
            View Details
          </button>
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
      </div>
      
      {isMounted && isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-slate-900/70 backdrop-blur-sm transition-opacity"
          onClick={() => setIsModalOpen(false)} 
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          >
            
            {/* Modal Header */}
            <div className="flex-shrink-0">
              <div className="h-4 w-full" style={{ backgroundColor: displayColor }}></div>
              <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 flex justify-between items-start bg-white">
                <div className="flex items-center space-x-4">
                  <span className="w-6 h-6 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: displayColor }}></span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{categoryName}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Category Profile & Metrics</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Official Description</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {description || <span className="italic text-slate-400">No official description has been provided for this category yet.</span>}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">System Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Assigned Vehicles</span>
                        <span className="text-xl font-bold text-slate-900">{vehicleCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">System ID</span>
                        <span className="text-sm font-mono font-bold text-slate-900">#{id}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Display Color</span>
                        <span className="inline-flex items-center gap-2 text-sm font-mono font-bold text-slate-900">
                          <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: displayColor }} />
                          {displayColor.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 border-t border-slate-200 bg-white flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-sm font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                Close Profile
              </button>
            </div>

          </div>
        </div>,
        document.body // 🚨 Teleport destination!
      )}
    </>
  );
}