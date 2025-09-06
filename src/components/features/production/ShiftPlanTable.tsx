// app/shift-info/new/page.tsx
"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewShiftInfo() {
  const router = useRouter();
  const [form, setForm] = useState({
    shift_desc: "",
    start_time: "",
    end_time: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
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

      router.push("/production");
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
            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={() => router.push("/production")} 
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