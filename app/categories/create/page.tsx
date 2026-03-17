'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CategoryRequest } from '@/types'; // Adjust path as needed

export default function CreateCategoryPage() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: CategoryRequest = {
      categoryName: categoryName.trim(),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create category.');

      // Kick back to the categories table on success
      router.push('/categories');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-12">
      {/* Back Navigation */}
      <Link href="/categories" className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-6 inline-flex items-center gap-2">
        ← Back to Categories
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Category</h1>
        <p className="text-gray-500 text-sm mb-6">Define a new transport classification for your fleet.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              placeholder="e.g., BRT, Minibus, Commuter Line"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push('/categories')}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium w-1/3"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-medium w-2/3 flex justify-center items-center"
              disabled={isSubmitting || !categoryName.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}