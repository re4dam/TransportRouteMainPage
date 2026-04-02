import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';
import CategoryActions from '@/components/Actions/CategoryActions';
import SearchBar from '@/components/SearchBar';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CategoriesPage(props: { searchParams: SearchParams }) {
  // 1. Read the URL parameters (Next.js 15 requires awaiting searchParams)
  const searchParams = await props.searchParams;
  const pageParam = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : "";

  // 2. Fetch the paginated data directly from the C# Backend
  let categories = [];
  let totalPages = 0;
  
  try {
    const endpoint = `/Category?pageNumber=${currentPage}&pageSize=12&keyword=${encodeURIComponent(keyword)}`;
    const res = await apiFetch(endpoint, { cache: 'no-store' });
    
    if (res.ok) {
        const data = await res.json();
        categories = data.items;
        totalPages = data.totalPages;
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  // Create base URL for pagination that includes search keyword
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (keyword) params.set("keyword", keyword);
    return `/categories?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end border-b-2 border-indigo-100 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            Available Categories
          </h1>
          <p className="text-sm text-indigo-400 mt-2 font-medium">Manage and track your active transit paths</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Search categories..." />
          <Link
            href="/categories/create"
            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30 whitespace-nowrap"
          >
            <span className="mr-2">+</span> Create Categories
          </Link>
        </div>
      </div>

      {/* Main Data Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm mt-6">
          <p className="text-slate-500 text-lg font-medium">No categories found.</p>
          <Link href="/categories" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {categories.map((category: any) => (
            <li
              key={category.id}
              className="group bg-white/80 backdrop-blur-sm border border-indigo-50 rounded-2xl p-6 shadow-lg shadow-indigo-100/50 hover:-translate-y-2 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
              
              <h2 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {category.categoryName}
              </h2>

              {/* Inject the Interactive Client Component */}
              <CategoryActions id={category.id} categoryName={category.categoryName} />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls - Standard HTML Links! */}
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