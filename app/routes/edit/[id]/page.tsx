"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// Generate the same array of hourly times
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export default function EditRoutePage() {
  const router = useRouter();
  const params = useParams(); // Grabs the [id] from the URL
  const routeId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    routeName: "",
    startingPoint: "",
    destination: "",
    startingHour: "05:00",
    endingHour: "22:00",
  });

  // Fetch the existing data when the page loads
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/TransitRoutes/${routeId}`);
        if (!res.ok) throw new Error("Failed to fetch route data.");
        
        const data = await res.json();
        // Pre-fill the form with the database data
        setFormData({
          routeName: data.routeName,
          startingPoint: data.startingPoint,
          destination: data.destination,
          startingHour: data.startingHour,
          endingHour: data.endingHour,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (routeId) {
      fetchRoute();
    }
  }, [routeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Send the PUT request to update the specific record
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/TransitRoutes/${routeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // We send the same DTO structure as the Create page
        body: JSON.stringify(formData), 
      });

      if (!res.ok) {
        throw new Error("Failed to update route. Please check your backend.");
      }

      router.refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto w-full flex justify-center items-center py-20">
        <div className="text-indigo-600 font-bold animate-pulse">Loading route data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Routes
        </Link>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 tracking-tight">
          Edit Route
        </h1>
        <p className="text-sm text-amber-600 mt-2 font-medium">Update the details for this transit path</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-amber-50 rounded-2xl p-8 shadow-xl shadow-amber-100/50">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="routeName" className="block text-sm font-bold text-slate-700 mb-2">Route Name</label>
            <input
              type="text"
              id="routeName"
              name="routeName"
              required
              value={formData.routeName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startingPoint" className="block text-sm font-bold text-slate-700 mb-2">Starting Point</label>
              <input
                type="text"
                id="startingPoint"
                name="startingPoint"
                required
                value={formData.startingPoint}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-bold text-slate-700 mb-2">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                required
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startingHour" className="block text-sm font-bold text-slate-700 mb-2">Starting Hour</label>
              <select
                id="startingHour"
                name="startingHour"
                required
                value={formData.startingHour}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm bg-white cursor-pointer"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="endingHour" className="block text-sm font-bold text-slate-700 mb-2">Ending Hour</label>
              <select
                id="endingHour"
                name="endingHour"
                required
                value={formData.endingHour}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm bg-white cursor-pointer"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
          <Link 
            href="/routes" 
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Route"}
          </button>
        </div>
      </form>
    </div>
  );
}