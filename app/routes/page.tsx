import RouteActions from "@/components/RouteActions";
import Link from "next/link";
import { TransitRouteResponse  } from "@/types";

// Next.js 15 treats searchParams as a Promise
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// We update our fetcher to handle the two different C# endpoints
async function getTransitRoutes(keyword?: string, pageNumber: number = 1) {
  if (keyword) {
    // Hit the Paginated Search Endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/TransitRoutes/search?keyword=${encodeURIComponent(keyword)}&pageNumber=${pageNumber}&pageSize=10`, {
      cache: 'no-store'
    });
    
    if (res.status === 404) return { items: [], totalPages: 0, currentPage: 1 };
    if (!res.ok) throw new Error('Failed to fetch search results');
    
    return res.json(); // Returns the PaginatedResponseDto shape
  } else {
    // Hit the standard GET Endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/TransitRoutes`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routes');
    
    const data = await res.json();
    // We wrap the raw array in an object so the component UI logic remains the same
    return { items: data, totalPages: 1, currentPage: 1 };
  }
}

export default async function Home(props: { searchParams: SearchParams }) {
  // Await the search parameters
  const searchParams = await props.searchParams;
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : undefined;
  const pageNumber = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  // Fetch the data
  const { items: liveRoutes, totalPages, currentPage } = await getTransitRoutes(keyword, pageNumber);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-end border-b-2 border-indigo-100 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            Available Routes
          </h1>
          <p className="text-sm text-indigo-400 mt-2 font-medium">Manage and track your active transit paths</p>
        </div>
        <Link
          href="/routes/create"
          className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          <span className="mr-2">+</span> Create Routes
        </Link>
      </div>

      {liveRoutes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-lg font-medium">No routes found matching your criteria.</p>
          {keyword && <Link href="/" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">Clear Search</Link>}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Pagination Controls - Only show if we have more than 1 page */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
          {currentPage > 1 && (
            <Link 
              href={`/?keyword=${keyword}&page=${currentPage - 1}`}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
            >
              &larr; Previous
            </Link>
          )}
          
          <span className="text-sm font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages && (
            <Link 
              href={`/?keyword=${keyword}&page=${currentPage + 1}`}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}