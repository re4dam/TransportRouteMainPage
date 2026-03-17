'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryResponse } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  // Note: Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Category`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id: number, categoryName: string) => {
    // 1. Ask for confirmation first
    const confirmed = window.confirm(`Are you sure you want to delete the "${categoryName}" category?\n\nWarning: Depending on your database rules, this might also delete all vehicles assigned to this category!`);
    
    if (!confirmed) return;

    setIsDeleting(id);
    
    try {
      // 2. Send the DELETE request to the C# API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Category/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // If EF Core blocks it due to foreign keys, it usually returns a 400 or 500
        throw new Error('Failed to delete. Ensure no vehicles are actively using this category before deleting.');
      }

      // 3. Update the UI instantly by filtering out the deleted ID
      setCategories((prev) => prev.filter((category) => category.id !== id));
      
    } catch (err: any) {
      alert(err.message); // Use a simple browser alert for delete errors so it doesn't break the table layout
    } finally {
      setIsDeleting(null);
    }
  };

  // Simple client-side pagination math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 1. Aligned Header Row - Matching Categories Style */}
      <div className="flex justify-between items-end border-b-2 border-indigo-100 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            Available Categories
          </h1>
          <p className="text-sm text-indigo-400 mt-2 font-medium">Manage and track your active transit paths</p>
        </div>
        <Link
          href="/categories/create"
          className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          <span className="mr-2">+</span> Create Categories
        </Link>
      </div>

      {/* Stats Badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {categories.length} Total
        </span>
        {isLoading && (
          <span className="text-sm text-slate-400 italic">Syncing...</span>
        )}
      </div>

      {/* 2. Main Data Grid - Replaced Table with Cards */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-lg font-medium">Loading categories...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-lg font-medium">No categories found.</p>
          <Link href="/" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
            Go Back Home
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((category) => (
            <li
              key={category.id}
              className="group bg-white/80 backdrop-blur-sm border border-indigo-50 rounded-2xl p-6 shadow-lg shadow-indigo-100/50 hover:shadow-2xl hover:-translate-y-2 hover:bg-white transition-all duration-300 ease-out relative overflow-hidden"
            >
              {/* Accent Bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>

              <div className="flex justify-between items-start mb-5">
                <h2 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {category.categoryName}
                </h2>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link href={`/categories/edit/${category.id}`} className="flex-1 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(category.id, category.categoryName)}
                  disabled={isDeleting === category.id}
                  className="flex-1 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 3. Pagination Controls - Matching Routes Style */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>

          <span className="text-sm font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}