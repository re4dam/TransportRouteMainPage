'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VehicleRequest, CategoryResponse, TransitRouteResponse } from '@/types';
import { apiFetch } from '@/lib/apiClient';

export const dynamic = 'force-dynamic';

export default function CreateVehiclePage() {
  const router = useRouter();
  
  // Form State
  const [vehicleName, setVehicleName] = useState('');
  const [categoryId, setCategoryId] = useState(''); 
  const [transitRouteId, setTransitRouteId] = useState('');

  // Dropdown Data State
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [routes, setRoutes] = useState<TransitRouteResponse[]>([]);

  // UI State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dropdown data on load
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoriesRes, routesRes] = await Promise.all([
          apiFetch(`/Category/all`),
          apiFetch(`/TransitRoutes/all`)
        ]);

        if (!categoriesRes.ok || !routesRes.ok) throw new Error('Failed to load system data.');

        setCategories(await categoriesRes.json());
        setRoutes(await routesRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // CRITICAL: We must parse the dropdown strings into Integers for the C# backend!
    const payload: VehicleRequest = {
      vehicleName: vehicleName.trim(),
      categoryId: parseInt(categoryId),
      transitRouteId: parseInt(transitRouteId)
    };

    const token = sessionStorage.getItem('csrf_token');

    try {
      const response = await apiFetch(`/Vehicle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token || '' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      router.push('/vehicles'); 
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="max-w-xl mx-auto p-6 mt-12 text-center text-gray-500">Loading system data...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-12">
      <Link href="/vehicles" className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-6 inline-flex items-center gap-2">
        ← Back to Vehicle Fleet
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assign New Vehicle</h1>
        <p className="text-gray-500 text-sm mb-6">Register a new vehicle and assign it to an active route.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Identifier / Name</label>
            <input
              type="text"
              required
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Express Bus 01, Train A2"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Category</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              disabled={isSubmitting}
            >
              <option value="" disabled>-- Select a Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Route</label>
            <select
              required
              value={transitRouteId}
              onChange={(e) => setTransitRouteId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              disabled={isSubmitting}
            >
              <option value="" disabled>-- Select a Route --</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.routeName} ({route.startingPoint} - {route.destination})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={() => router.push('/vehicles')}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium w-1/3"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-medium w-2/3"
              disabled={isSubmitting || !vehicleName.trim() || !categoryId || !transitRouteId}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}