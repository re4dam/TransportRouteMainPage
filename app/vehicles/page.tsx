import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';
import VehicleActions from '@/components/Actions/VehicleActions';
import SearchBar from '@/components/SearchBar';
import VehicleCreateButton from '@/components/CreateButton/VehicleCreateButton';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function VehiclesPage(props: { searchParams: SearchParams }) {
  // 1. Read URL parameters for Pagination and Search
  const searchParams = await props.searchParams;
  const pageParam = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : "";
  const pageSize = 12;

  // 2. Fetch the paginated data directly from the C# Backend
  let vehicles = [];
  let totalPages = 0;
  let totalCount = 0;
  
  try {
    const endpoint = `/Vehicle?pageNumber=${currentPage}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`;
    const res = await apiFetch(endpoint, { cache: 'no-store' });
    
    if (res.ok) {
        const data = await res.json();
        vehicles = data.items || [];
        totalPages = data.totalPages || 0;
        totalCount = data.totalCount || vehicles.length;
    } else {
        const errorText = await res.text();
        console.error(`🚨 C# API ERROR: ${res.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("🚨 NEXT.JS FETCH CRASH:", error);
  }

  // Create base URL for pagination that includes search keyword
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (keyword) params.set("keyword", keyword);
    return `/vehicles?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 1. Aligned Header Row */}
      <div className="flex justify-between items-end border-b-2 border-indigo-100 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            Available Vehicles
          </h1>
          <p className="text-sm text-indigo-400 mt-2 font-medium">Manage and track your active fleet</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Search vehicles..." />
          <VehicleCreateButton />
        </div>
      </div>

      {/* Stats Badge */}
      <div className="mb-6 mt-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {totalCount} Total {keyword && `matching "${keyword}"`}
        </span>
      </div>

      {/* 2. Main Data Grid */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm mt-6">
          <p className="text-slate-500 text-lg font-medium">No vehicles found.</p>
          <Link href="/vehicles" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle: any) => (
            <li
              key={vehicle.id}
              className="group bg-white/80 backdrop-blur-sm border border-indigo-50 rounded-2xl p-6 shadow-lg shadow-indigo-100/50 hover:shadow-2xl hover:-translate-y-2 hover:bg-white transition-all duration-300 ease-out relative overflow-hidden"
            >
              {/* Accent Bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>

              <div className="flex justify-between items-start mb-5">
                <h2 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {vehicle.vehicleName}
                </h2>
              </div>

              {/* Vehicle Info Box */}
              <div className="mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                    <span className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Category:</span> {vehicle.categoryName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                    <span className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Route:</span> {vehicle.routeName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Inject the Interactive Client Component */}
              <VehicleActions id={vehicle.id} vehicleName={vehicle.vehicleName} />
            </li>
          ))}
        </ul>
      )}

      {/* 4. Pagination Controls - Using Standard HTML Links */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
          {currentPage > 1 ? (
            <Link 
              href={getPaginationUrl(currentPage - 1)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
            >
              &larr; Previous
            </Link>
          ) : (
            <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 opacity-50 cursor-not-allowed">
              &larr; Previous
            </span>
          )}

          <span className="text-sm font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link 
              href={getPaginationUrl(currentPage + 1)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
            >
              Next &rarr;
            </Link>
          ) : (
             <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 opacity-50 cursor-not-allowed">
              Next &rarr;
            </span>
          )}
        </div>
      )}
    </div>
  );
}