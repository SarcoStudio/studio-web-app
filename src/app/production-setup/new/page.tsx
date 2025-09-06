"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// Define the type for the form state
type ProductionForm = {
  product_id: string;
  product_name: string;
  product_desc: string;
  product_group: string;
  mach_name: string;
  mach_dep: string;
  mach_id: string;
  signal_mult: string;
  production_target: string;
};

// Define types for products and machines
type Product = {
  product_id: string;
  product_name: string;
  product_desc: string;
  product_group: string;
};

type Machine = {
  unit_id: string;
  mach_id: string;
  mach_name: string;
  mach_dep: string;
};

export default function NewProductionForm() {
  const router = useRouter();
  const [form, setForm] = useState<ProductionForm>({
    product_id: "",
    product_name: "",
    product_desc: "",
    product_group: "",
    mach_name: "",
    mach_dep: "",
    mach_id: "",
    signal_mult: "",
    production_target: "",
  });
  const [error, setError] = useState<string>("");
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  
  // Filter states
  const [productIdFilter, setProductIdFilter] = useState("");
  const [productNameFilter, setProductNameFilter] = useState("");
  const [machineIdFilter, setMachineIdFilter] = useState("");
  const [machineNameFilter, setMachineNameFilter] = useState("");
  
  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch products and machines on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsResponse = await fetch("/api/product");
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsResponse.json();
        console.log("Fetched products:", productsData);
        setProducts(productsData);
        
        // Fetch machines
        const machinesResponse = await fetch("/api/equipment");
        if (!machinesResponse.ok) {
          throw new Error("Failed to fetch machines");
        }
        const machinesData = await machinesResponse.json();
        console.log("Fetched machines:", machinesData);
        
        // Check for null or undefined mach_id values
        const machinesWithIssues = machinesData.filter(m => !m.mach_id);
        if (machinesWithIssues.length > 0) {
          console.warn("Warning: Some machines have null or undefined mach_id:", machinesWithIssues);
        }
        
        setMachines(machinesData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load products and machines data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter products by ID
  const filteredProductIds = products
    .filter(product => 
      product.product_id && product.product_id.toLowerCase().includes(productIdFilter.toLowerCase())
    )
    .map(product => product.product_id)
    .filter(Boolean) as string[];
  
  // Filter products by name
  const filteredProductNames = products
    .filter(product => 
      product.product_name && product.product_name.toLowerCase().includes(productNameFilter.toLowerCase())
    )
    .map(product => product.product_name)
    .filter(Boolean) as string[];
  
  // Filter machines by ID
  const filteredMachineIds = machines
    .filter(machine => 
      machine.mach_id && machine.mach_id.toLowerCase().includes(machineIdFilter.toLowerCase())
    )
    .map(machine => machine.mach_id)
    .filter(Boolean) as string[];
  
  // Filter machines by name
  const filteredMachineNames = machines
    .filter(machine => 
      machine.mach_name && machine.mach_name.toLowerCase().includes(machineNameFilter.toLowerCase())
    )
    .map(machine => machine.mach_name)
    .filter(Boolean) as string[];

  // Handle product ID change - update related fields
  const handleProductIdChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedProductId = e.target.value;
    const selectedProduct = products.find(p => p.product_id === selectedProductId);
    
    if (selectedProduct) {
      setForm(prev => ({
        ...prev,
        product_id: selectedProduct.product_id || "",
        product_name: selectedProduct.product_name || "",
        product_desc: selectedProduct.product_desc || "",
        product_group: selectedProduct.product_group || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        product_id: selectedProductId,
        product_name: "",
        product_desc: "",
        product_group: ""
      }));
    }
  };

  // Handle product name change - update related fields
  const handleProductNameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedProductName = e.target.value;
    const selectedProduct = products.find(p => p.product_name === selectedProductName);
    
    if (selectedProduct) {
      setForm(prev => ({
        ...prev,
        product_id: selectedProduct.product_id || "",
        product_name: selectedProduct.product_name || "",
        product_desc: selectedProduct.product_desc || "",
        product_group: selectedProduct.product_group || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        product_name: selectedProductName,
        product_id: "",
        product_desc: "",
        product_group: ""
      }));
    }
  };

  // Handle machine ID change - update related fields
  const handleMachineIdChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedMachineId = e.target.value;
    const selectedMachine = machines.find(m => m.mach_id === selectedMachineId);
    
    if (selectedMachine) {
      setForm(prev => ({
        ...prev,
        mach_id: selectedMachine.mach_id || "",
        mach_name: selectedMachine.mach_name || "",
        mach_dep: selectedMachine.mach_dep || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        mach_id: selectedMachineId,
        mach_name: "",
        mach_dep: ""
      }));
    }
  };

  // Handle machine name change - update related fields
  const handleMachineNameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedMachineName = e.target.value;
    const selectedMachine = machines.find(m => m.mach_name === selectedMachineName);
    
    if (selectedMachine) {
      setForm(prev => ({
        ...prev,
        mach_id: selectedMachine.mach_id || "",
        mach_name: selectedMachine.mach_name || "",
        mach_dep: selectedMachine.mach_dep || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        mach_name: selectedMachineName,
        mach_id: "",
        mach_dep: ""
      }));
    }
  };

  // Handle numeric input fields
  const handleNumericChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only update if value is numeric or empty
    if (value === "" || !isNaN(Number(value))) {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    // Validate required fields
    if (!form.product_id || !form.mach_id || !form.signal_mult || !form.production_target) {
      setError("Please fill all required fields");
      return;
    }
    
    try {
      const response = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add production record");
      }

      router.push("/production-setup");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-4 text-center">Add New Production Record</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Product ID Field with Filter */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Product ID *</label>
              <div className="relative">
                <input
                  type="text"
                  value={productIdFilter}
                  onChange={(e) => setProductIdFilter(e.target.value)}
                  placeholder="Filter Product IDs..."
                  className="border px-4 py-2 rounded-t-lg w-full"
                />
                <select
                  name="product_id"
                  value={form.product_id}
                  onChange={handleProductIdChange}
                  required
                  className="border border-t-0 px-4 py-2 rounded-b-lg w-full"
                >
                  <option value="">Select Product ID</option>
                  {filteredProductIds.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Product Name Field with Filter */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Product Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={productNameFilter}
                  onChange={(e) => setProductNameFilter(e.target.value)}
                  placeholder="Filter Product Names..."
                  className="border px-4 py-2 rounded-t-lg w-full"
                />
                <select
                  name="product_name"
                  value={form.product_name}
                  onChange={handleProductNameChange}
                  required
                  className="border border-t-0 px-4 py-2 rounded-b-lg w-full"
                  disabled={form.product_id !== ""}
                >
                  <option value="">Select Product Name</option>
                  {filteredProductNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Machine ID Field with Filter */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Machine ID *</label>
              <div className="relative">
                <input
                  type="text"
                  value={machineIdFilter}
                  onChange={(e) => setMachineIdFilter(e.target.value)}
                  placeholder="Filter Machine IDs..."
                  className="border px-4 py-2 rounded-t-lg w-full"
                />
                <select
                  name="mach_id"
                  value={form.mach_id}
                  onChange={handleMachineIdChange}
                  required
                  className="border border-t-0 px-4 py-2 rounded-b-lg w-full"
                >
                  <option value="">Select Machine ID</option>
                  {filteredMachineIds.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Machine Name Field with Filter */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Machine Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={machineNameFilter}
                  onChange={(e) => setMachineNameFilter(e.target.value)}
                  placeholder="Filter Machine Names..."
                  className="border px-4 py-2 rounded-t-lg w-full"
                />
                <select
                  name="mach_name"
                  value={form.mach_name}
                  onChange={handleMachineNameChange}
                  required
                  className="border border-t-0 px-4 py-2 rounded-b-lg w-full"
                  disabled={form.mach_id !== ""}
                >
                  <option value="">Select Machine Name</option>
                  {filteredMachineNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Auto-populated fields */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Product Description</label>
              <input 
                type="text" 
                name="product_desc" 
                value={form.product_desc} 
                readOnly 
                placeholder="Auto-populated from Product ID" 
                className="border px-4 py-2 rounded-lg bg-gray-100" 
              />
            </div>
            
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Product Group</label>
              <input 
                type="text" 
                name="product_group" 
                value={form.product_group} 
                readOnly 
                placeholder="Auto-populated from Product ID" 
                className="border px-4 py-2 rounded-lg bg-gray-100" 
              />
            </div>
            
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Machine Department</label>
              <input 
                type="text" 
                name="mach_dep" 
                value={form.mach_dep} 
                readOnly 
                placeholder="Auto-populated from Machine ID" 
                className="border px-4 py-2 rounded-lg bg-gray-100" 
              />
            </div>
            
            {/* Numeric input fields */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Signal Multiplier *</label>
              <input 
                type="number" 
                step="0.01" 
                name="signal_mult" 
                value={form.signal_mult} 
                onChange={handleNumericChange}
                placeholder="Signal Multiplier" 
                required 
                className="border px-4 py-2 rounded-lg" 
              />
            </div>
            
            <div className="flex flex-col col-span-2">
              <label className="mb-1 text-sm font-medium">Production Target *</label>
              <input 
                type="number" 
                step="1" 
                name="production_target" 
                value={form.production_target} 
                onChange={handleNumericChange}
                placeholder="Production Target" 
                required 
                className="border px-4 py-2 rounded-lg" 
              />
            </div>
            
            <button 
              type="submit" 
              className="col-span-2 mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
            >
              Add Production Record
            </button>
          </form>
          <div className="mt-4 text-center">
            <button 
              onClick={() => router.push("/production-setup")} 
              className="text-blue-600 hover:underline"
            >
              Back to Production Setup
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}