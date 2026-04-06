'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';
import { useToast } from '@/components/ToastClient';

// 🚨 1. The Expanded Data Contract
export interface ArchiveItemDto {
    id: number;
    primaryText: string;      // e.g., "Downtown Express" or "Bus #402"
    secondaryText: string;    // e.g., "Central Station -> Main Square"
    archivedAt: string;       // ISO Date string
    archivedBy: string;       // Username of who deleted it
}

interface ArchiveTableProps {
    domainName: string;          
    fetchEndpoint: string;       
    restoreEndpointTemplate: string; 
    activeEntitiesPath: string;  // Where to send them if the archive is empty (e.g., "/routes")
}

export default function GenericArchiveTable({ 
    domainName, 
    fetchEndpoint, 
    restoreEndpointTemplate,
    activeEntitiesPath 
}: ArchiveTableProps) {
    const [data, setData] = useState<ArchiveItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    
    // UI Enhancements State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [restoringId, setRestoringId] = useState<number | null>(null); // Row-level loading
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, item: ArchiveItemDto | null}>({ isOpen: false, item: null });

    const router = useRouter();
    const { showToast } = useToast();

    // Security & Fetching
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

    const fetchData = async () => {
        try {
            const response = await apiFetch(fetchEndpoint);
            setData(await response.json());
        } catch (error: any) {
            showToast(`Failed to load ${domainName} archives`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // 🚨 2. The Restore Execution
    const executeRestore = async () => {
        if (!confirmModal.item) return;
        const targetId = confirmModal.item.id;
        
        setRestoringId(targetId); // Start row spinner
        setConfirmModal({ isOpen: false, item: null }); // Close modal
        const token = sessionStorage.getItem('csrf_token');

        try {
            const endpoint = restoreEndpointTemplate.replace('{id}', targetId.toString());
            await apiFetch(endpoint, { 
                method: 'PATCH',
                credentials: 'include',
                headers: { 'X-CSRF-Token': token || '' }
            });
            
            showToast(`${domainName} restored successfully`, "success");
            setData(current => current.filter(item => item.id !== targetId));
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setRestoringId(null); // Stop spinner
        }
    };

    // 🚨 3. Client-Side Search & Sort
    const filteredAndSortedData = useMemo(() => {
        let processed = data.filter(item => 
            item.primaryText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.secondaryText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.archivedBy.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return processed.sort((a, b) => {
            const dateA = new Date(a.archivedAt).getTime();
            const dateB = new Date(b.archivedAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [data, searchQuery, sortOrder]);

    if (!isAuthorized) return null;
    if (isLoading) return <div className="text-center py-10 text-gray-500 font-medium animate-pulse">Loading archives...</div>;

    // 🚨 4. Upgraded Empty State
    if (data.length === 0) {
        return (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No {domainName}s Archived</h3>
                <p className="mt-1 text-sm text-gray-500">The archive is currently completely clean.</p>
                <div className="mt-6">
                    <button onClick={() => router.push(activeEntitiesPath)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                        &larr; Return to Active {domainName}s
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6">
            {/* The Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0">
                <input 
                    type="text" 
                    placeholder="Search by name, details, or admin..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-96 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border"
                />
                <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full sm:w-auto border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>

            {/* The Data Grid */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <caption className="sr-only">List of archived {domainName}s</caption>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Details</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Archive Metadata</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                {/* Column 1: Asset Details */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                                                <span>{item.primaryText}</span>
                                                <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-red-100 text-red-800 uppercase">
                                                    Archived
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">{item.secondaryText}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">ID: #{item.id}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Column 2: Metadata */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(item.archivedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">by <span className="font-medium text-gray-700">{item.archivedBy}</span></div>
                                </td>

                                {/* Column 3: Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => setConfirmModal({ isOpen: true, item })}
                                        disabled={restoringId === item.id}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-all 
                                            ${restoringId === item.id ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
                                        aria-live="polite"
                                    >
                                        {restoringId === item.id ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Restoring...
                                            </span>
                                        ) : (
                                            "Restore Asset"
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🚨 5. The Two-Step Confirmation Modal */}
            {confirmModal.isOpen && confirmModal.item && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Restoration</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            You are about to restore <strong className="text-gray-900">{confirmModal.item.primaryText}</strong>. 
                            This asset will immediately become visible and actionable to all active users.
                        </p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button 
                                onClick={() => setConfirmModal({ isOpen: false, item: null })}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeRestore}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm"
                            >
                                Yes, Restore Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}