'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { VehicleRequest, CategoryResponse, TransitRouteResponse } from '@/types';
import { apiFetch } from '@/lib/apiClient';

export const dynamic = 'force-dynamic';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id;

  const [vehicleName, setVehicleName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transitRouteId, setTransitRouteId] = useState('');

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [routes, setRoutes] = useState<TransitRouteResponse[]>([]);

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch dropdowns and the specific vehicle simultaneously
        const [categoriesRes, routesRes, vehicleRes] = await Promise.all([
          apiFetch(`/Category/all`),
          apiFetch(`/TransitRoutes/all`),
          apiFetch(`/Vehicle/${vehicleId}`, {credentials: 'include'})
        ]);

        if (!categoriesRes.ok || !routesRes.ok || !vehicleRes.ok) {
          throw new Error('Failed to load required data.');
        }

        const catsData: CategoryResponse[] = await categoriesRes.json();
        const routesData: TransitRouteResponse[] = await routesRes.json();
        const vehicleData = await vehicleRes.json();

        setCategories(catsData);
        setRoutes(routesData);
        setVehicleName(vehicleData.vehicleName);

        // Replace the .find() logic with this direct assignment:
        setCategoryId(vehicleData.categoryId.toString());
        setTransitRouteId(vehicleData.transitRouteId.toString());

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    if (vehicleId) fetchAllData();
  }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: VehicleRequest = {
      vehicleName: vehicleName.trim(),
      categoryId: parseInt(categoryId),
      transitRouteId: parseInt(transitRouteId)
    };

    const token = sessionStorage.getItem('csrf_token');

    try {
      const response = await apiFetch(`/Vehicle/${vehicleId}`, {
        method: 'PUT',
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

  if (isFetching) return <div className="max-w-xl mx-auto p-6 mt-12 text-center text-gray-500">Loading vehicle details...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 mt-12">
      <Link href="/vehicles" className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-6 inline-flex items-center gap-2">
        ← Back to Vehicle Fleet
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Vehicle</h1>
        <p className="text-gray-500 text-sm mb-6">Update assignments for Vehicle ID: {vehicleId}</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Identifier / Name</label>
            <input
              type="text"
              required
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
            <button type="button" onClick={() => router.push('/vehicles')} className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium w-1/3" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-medium w-2/3" disabled={isSubmitting || !vehicleName.trim() || !categoryId || !transitRouteId}>
              {isSubmitting ? 'Updating...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}