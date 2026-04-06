'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';
import { useToast } from '@/components/ToastClient';

// We define props so the Server Page can tell this table how to behave
interface ArchiveTableProps {
    domainName: string;          // e.g., "Route", "Vehicle"
    fetchEndpoint: string;       // e.g., "/TransitRoutes/archives"
    restoreEndpointTemplate: string; // e.g., "/TransitRoutes/{id}/restore"
}

export default function GenericArchiveTable({ domainName, fetchEndpoint, restoreEndpointTemplate }: ArchiveTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const getItemDisplayName = (item: any) => {
        const directName =
            item.name ||
            item.title ||
            item.licensePlate ||
            item.routeName ||
            item.categoryName ||
            item.vehicleName;

        if (directName) return directName;

        if (item.startingPoint || item.destination) {
            return `${item.startingPoint || 'Unknown Start'} -> ${item.destination || 'Unknown Destination'}`;
        }

        return 'Unnamed Item';
    };

    // 1. Security Bouncer
    useEffect(() => {
        const storedRoles = localStorage.getItem('userRoles');
        if (storedRoles) {
            const roles = JSON.parse(storedRoles);
            if (roles.includes('SuperAdmin') || roles.includes('RouteManager')) {
                setIsAuthorized(true);
                fetchData();
                return;
            }
        }
        router.push('/');
    }, []);

    // 2. Generic Fetcher
    const fetchData = async () => {
        try {
            const response = await apiFetch(fetchEndpoint);
            const payload = await response.json();
            const items = Array.isArray(payload) ? payload : payload.items || [];
            setData(items);
        } catch (error: any) {
            showToast(`Failed to load ${domainName} archives`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Generic Restore
    const handleRestore = async (id: number) => {
        if (!confirm(`Are you sure you want to restore this ${domainName}?`)) return;

        try {
            // Replace {id} with the actual ID
            const endpoint = restoreEndpointTemplate.replace('{id}', id.toString());
            await apiFetch(endpoint, { method: 'PATCH' });
            
            showToast(`${domainName} restored successfully`, "success");
            setData(current => current.filter(item => item.id !== id));
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    if (!isAuthorized) return null;
    if (isLoading) return <div className="text-center py-10 text-gray-500">Loading archives...</div>;
    if (data.length === 0) return <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg m-4">No archived {domainName}s found.</div>;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Detail</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{item.id}</td>
                            {/* Display a meaningful label even when DTOs use different property names */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {getItemDisplayName(item)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleRestore(item.id)} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md">
                                    Restore
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}