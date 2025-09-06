"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function NewEquipment() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState({
    unit_id: "",
    gpio_num: "",
    field_id: "F01",
    mach_id: "",
    mach_dep: "",
    mach_name: "",
    refresh_int: "",
    target_good: "",
    target_acceptable: "",
    target_bad: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate mach_id when unit_id or field_id changes
  useEffect(() => {
    if (form.unit_id && form.field_id) {
      const generatedMachId = `${form.unit_id}-${form.field_id}`;
      setForm(prev => ({ ...prev, mach_id: generatedMachId }));
    } else {
      setForm(prev => ({ ...prev, mach_id: "" }));
    }
  }, [form.unit_id, form.field_id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add equipment");
      }
      
      // Success - redirect to equipment list
      router.push("/equipment-setup");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Authentication Required</p>
          <p>Please log in to add new equipment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.push("/equipment-setup")} 
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Equipment List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Equipment</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit ID *
                  </label>
                  <input 
                    type="text" 
                    name="unit_id" 
                    value={form.unit_id} 
                    onChange={handleChange} 
                    placeholder="Enter Unit ID" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPIO Number *
                  </label>
                  <input 
                    type="number" 
                    name="gpio_num" 
                    value={form.gpio_num} 
                    onChange={handleChange} 
                    placeholder="Enter GPIO Number" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field ID *
                  </label>
                  <select 
                    name="field_id" 
                    value={form.field_id} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 11 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`).map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Machine ID (Auto-generated)
                  </label>
                  <input 
                    type="text" 
                    name="mach_id" 
                    value={form.mach_id} 
                    readOnly 
                    placeholder="Auto-generated from Unit ID and Field ID" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 text-gray-600" 
                  />
                </div>
              </div>
            </div>

            {/* Machine Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Machine Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input 
                    type="text" 
                    name="mach_dep" 
                    value={form.mach_dep} 
                    onChange={handleChange} 
                    placeholder="Enter Department" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Machine Name *
                  </label>
                  <input 
                    type="text" 
                    name="mach_name" 
                    value={form.mach_name} 
                    onChange={handleChange} 
                    placeholder="Enter Machine Name" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refresh Interval *
                  </label>
                  <input 
                    type="text" 
                    name="refresh_int" 
                    value={form.refresh_int} 
                    onChange={handleChange} 
                    placeholder="HH:MM (e.g., 00:30)" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
            </div>

            {/* Target Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Settings (%)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Good % *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="100"
                    name="target_good" 
                    value={form.target_good} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Acceptable % *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="100"
                    name="target_acceptable" 
                    value={form.target_acceptable} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Bad % *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="100"
                    name="target_bad" 
                    value={form.target_bad} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    required 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Equipment...
                  </span>
                ) : (
                  "Add Equipment"
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => router.push("/equipment-setup")} 
                className="flex-1 sm:flex-initial bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}