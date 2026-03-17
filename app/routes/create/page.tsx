"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Generate an array of hourly times from "00:00" to "23:00"
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export default function CreateRoutePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    routeName: "",
    startingPoint: "",
    destination: "",
    startingHour: "05:00",
    endingHour: "22:00",
  });

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/TransitRoutes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create route. Please check your backend.");
      }

      router.refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Routes
        </Link>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
          Create New Route
        </h1>
        <p className="text-sm text-indigo-400 mt-2 font-medium">Add a new transit path to your database</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-indigo-50 rounded-2xl p-8 shadow-xl shadow-indigo-100/50">
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
              placeholder="e.g. Cicaheum - Ledeng"
              value={formData.routeName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
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
                placeholder="e.g. Terminal Cicaheum"
                value={formData.startingPoint}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-bold text-slate-700 mb-2">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                required
                placeholder="e.g. Terminal Ledeng"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white cursor-pointer"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white cursor-pointer"
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
            className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Route"}
          </button>
        </div>
      </form>
    </div>
  );
}