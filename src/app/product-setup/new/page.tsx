"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// Define the type for the form state
type ProductForm = {
  product_id: string;
  product_name: string;
  product_desc?: string;
  product_group: string;
  unit_size: string;
  unit_type: string;
};

export default function NewProductForm() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>({
    product_id: "",
    product_name: "",
    product_group: "",
    unit_size: "",
    unit_type: "",
  });
  const [error, setError] = useState<string>("");

  // Add type annotation for the event
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add type annotation for the event
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        // Try to parse error response
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add product");
      }

      router.push("/product-setup"); // Redirect to product list page
    } catch (error: unknown) {
      // Handle error with type safety
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-4 text-center">Add New Product</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              name="product_id" 
              value={form.product_id} 
              onChange={handleChange} 
              placeholder="Product ID" 
              required 
              className="border px-4 py-2 rounded-lg" 
            />
            <input 
              type="text" 
              name="product_name" 
              value={form.product_name} 
              onChange={handleChange} 
              placeholder="Product Name" 
              required 
              className="border px-4 py-2 rounded-lg" 
            />
            <input 
              type="text" 
              name="product_desc" 
              value={form.product_desc || ""} 
              onChange={handleChange} 
              placeholder="Product Description (Auto-Generated)" 
              readOnly 
              className="border px-4 py-2 rounded-lg bg-gray-100 cursor-not-allowed" 
            />
            <input 
              type="text" 
              name="product_group" 
              value={form.product_group} 
              onChange={handleChange} 
              placeholder="Product Group" 
              required 
              className="border px-4 py-2 rounded-lg" 
            />
            <input 
              type="number" 
              step="0.01" 
              name="unit_size" 
              value={form.unit_size} 
              onChange={handleChange} 
              placeholder="Unit Size" 
              required 
              className="border px-4 py-2 rounded-lg" 
            />
            <input 
              type="text" 
              name="unit_type" 
              value={form.unit_type} 
              onChange={handleChange} 
              placeholder="Unit Type" 
              required 
              className="border px-4 py-2 rounded-lg" 
            />
            <button 
              type="submit" 
              className="col-span-2 mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
            >
              Add Product
            </button>
          </form>
          <div className="mt-4 text-center">
            <button 
              onClick={() => router.push("/product-setup")} 
              className="text-blue-600 hover:underline"
            >
              Back to Product List
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}