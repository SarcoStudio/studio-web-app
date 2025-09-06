"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewShiftInfo() {
  const router = useRouter();
  const [form, setForm] = useState({
    shift_desc: "",
    start_time: "",
    end_time: "",
    spans_next_day: false
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate shift duration
  const calculateDuration = (): string => {
    if (!form.start_time || !form.end_time) return "";
    
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    
    const [startHours, startMinutes] = form.start_time.split(':').map(Number);
    const [endHours, endMinutes] = form.end_time.split(':').map(Number);
    
    let startDate = new Date(baseDate);
    startDate.setHours(startHours, startMinutes);
    
    let endDate = new Date(baseDate);
    endDate.setHours(endHours, endMinutes);
    
    if (form.spans_next_day) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.round(durationMinutes % 60);
    
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (!form.shift_desc || !form.start_time || !form.end_time) {
      setError("All fields are required");
      return;
    }
    
    try {
      const response = await fetch("/api/shift-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add shift");
      }

      // Navigate to production-setup page with shiftplan tab active
      router.push("/production-setup?tab=shiftplan");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Add New Shift</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shift Description</label>
              <input 
                type="text" 
                name="shift_desc" 
                value={form.shift_desc} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input 
                type="time" 
                name="start_time" 
                value={form.start_time} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input 
                type="time" 
                name="end_time" 
                value={form.end_time} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                required 
              />
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="spans_next_day" 
                name="spans_next_day" 
                checked={form.spans_next_day} 
                onChange={handleChange} 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded" 
              />
              <label htmlFor="spans_next_day" className="ml-2 block text-sm text-gray-700">
                Shift extends to next day
              </label>
            </div>
            
            {form.start_time && form.end_time && (
              <div className="bg-gray-50 p-2 rounded-md">
                <span className="text-sm font-medium text-gray-700">Duration: </span>
                <span className="text-sm text-gray-900">{calculateDuration()}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={() => router.push("/production-setup?tab=shiftplan")} 
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Save Shift
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}