'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ArchiveAccessButtonProps = {
  href: string;
  label: string;
};

export default function ArchiveAccessButton({ href, label }: ArchiveAccessButtonProps) {
  const [canAccessArchives, setCanAccessArchives] = useState(false);

  useEffect(() => {
    try {
      const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      const hasAccess = roles.includes('SuperAdmin') || roles.includes('RouteManager');
      setCanAccessArchives(hasAccess);
    } catch {
      setCanAccessArchives(false);
    }
  }, []);

  if (!canAccessArchives) return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all whitespace-nowrap"
    >
      {label}
    </Link>
  );
}
