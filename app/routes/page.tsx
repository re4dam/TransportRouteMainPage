import RouteActions from "@/components/Actions/RouteActions";
import Link from "next/link";
import { TransitRouteResponse  } from "@/types";
import { apiFetch } from "@/lib/apiClient"; 
import SearchBar from "@/components/SearchBar";

// Next.js 15 treats searchParams as a Promise
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  // 1. Read the URL parameters
  const searchParams = await props.searchParams;
  const pageParam = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : "";

  // 2. Fetch paginated routes from backend
  let liveRoutes: TransitRouteResponse[] = [];
  let totalPages = 0;
  let totalCount = 0;

  try {
    const endpoint = `/TransitRoutes?pageNumber=${currentPage}&pageSize=12&keyword=${encodeURIComponent(keyword)}`;
    const res = await apiFetch(endpoint, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      liveRoutes = data.items ?? [];
      totalPages = data.totalPages ?? 0;
      totalCount = data.totalCount ?? liveRoutes.length;
    }
  } catch (error) {
    console.error("Failed to fetch routes:", error);
  }

  // Create base URL for pagination that includes search keyword
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (keyword) params.set("keyword", keyword);
    return `/routes?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end border-b-2 border-indigo-100 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            Available Routes
          </h1>
          <p className="text-sm text-indigo-400 mt-2 font-medium">Manage and track your active transit paths</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Search routes..." />
          <Link
            href="/routes/create"
            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 whitespace-nowrap"
          >
            <span className="mr-2">+</span> Create Routes
          </Link>
        </div>
      </div>

      {/* Stats Badge */}
      <div className="mb-6 mt-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {totalCount} Total {keyword && `matching "${keyword}"`}
        </span>
      </div>

      {liveRoutes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm mt-6">
          <p className="text-slate-500 text-lg font-medium">No routes found.</p>
          <Link href="/routes" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {liveRoutes.map((route: TransitRouteResponse) => (
            <li 
              key={route.id} 
              className="group bg-white/80 backdrop-blur-sm border border-indigo-50 rounded-2xl p-6 shadow-lg shadow-indigo-100/50 hover:shadow-2xl hover:-translate-y-2 hover:bg-white transition-all duration-300 ease-out relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
              
              <div className="flex justify-between items-start mb-5">
                <h2 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {route.routeName}
                </h2>
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 text-indigo-700">
                  <span className="text-xs font-bold tracking-wide">
                    {route.startingHour} - {route.endingHour}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                  <div className="w-0.5 h-8 bg-slate-300 my-1"></div>
                  <div className="w-3 h-3 rounded-full border-4 border-rose-400 bg-white shadow-[0_0_10px_rgba(251,113,133,0.5)]"></div>
                </div>
                <div className="flex flex-col gap-5">
                  <span className="font-bold text-slate-700 text-base">{route.startingPoint}</span>
                  <span className="font-bold text-slate-700 text-base">{route.destination}</span>
                </div>
              </div>

              <RouteActions routeId={route.id} />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
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