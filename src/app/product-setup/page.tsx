"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import TableFunctions from "@/components/TableFunctions";
import { FaPlus, FaSync } from "react-icons/fa";

// Define types for the product
type Product = {
  product_id: string;
  product_name: string;
  product_desc: string;
  product_group: string;
  unit_size: number;
  unit_type: string;
};

// Define types for columns and search options
type Column = {
  field: string;
  header: string;
  editable: boolean;
  type?: 'dropdown' | 'text';
  inputType?: string;
};

type SearchOption = {
  value: string;
  label: string;
};

export default function ProductSetup() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [searchField, setSearchField] = useState("product_id");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<string[]>([]);

  // Define column structure for this specific page
  const columns: Column[] = [
    { field: "product_id", header: "Product ID", editable: false },
    { field: "product_name", header: "Product Name", editable: false },
    { field: "product_desc", header: "Description", editable: false },
    { field: "product_group", header: "Product Group", editable: true, type: "dropdown" },
    { field: "unit_size", header: "Unit Size", editable: true, inputType: "number" },
    { field: "unit_type", header: "Unit Type", editable: true, inputType: "text" }
  ];

  // Define search options for this specific page
  const searchOptions: SearchOption[] = [
    { value: "product_id", label: "Product ID" },
    { value: "product_name", label: "Product Name" },
    { value: "product_group", label: "Product Group" }
  ];

  // Initialize form when edit mode is activated
  useEffect(() => {
    if (selectedProduct && editMode) {
      // Make a copy of selectedProduct to avoid modifying it directly
      setForm({...selectedProduct});
    }
  }, [selectedProduct, editMode]);

  useEffect(() => {
    getCurrentUser()
      .then(() => setIsAuthenticated(true))
      .catch(() => router.push("/login"));
    fetchProducts();
  }, [router]);

  const fetchProducts = () => {
    // Add cache-busting parameter to prevent caching
    const timestamp = new Date().getTime();
    fetch(`/api/product?t=${timestamp}`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        console.log("Fetched products:", data);
        setProducts(data);
        setFilteredProducts(data);
        
        // Extract unique product groups from data
        const uniqueGroups = [...new Set(data.map(item => item.product_group))];
        setProductGroups(uniqueGroups.filter(group => group)); // Filter out null/undefined values
      })
      .catch((error) => console.error("❌ Fetch Products Error:", error));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    try {
      console.log("Beginning save process");
      
      // Make sure we have the selectedProduct
      if (!selectedProduct) {
        console.error("No selected product");
        alert("Error: No product selected");
        return;
      }
      
      // Log the original selectedProduct and form
      console.log("Original selected product:", selectedProduct);
      console.log("Form data:", form);
      
      // Prepare update data combining original product with edited fields
      const updatedForm: Product = {
        // Always use the original product_id
        product_id: selectedProduct.product_id,
        
        // Use edited fields when available, otherwise use original values
        product_name: form.product_name || selectedProduct.product_name,
        product_group: form.product_group || selectedProduct.product_group,
        
        // Handle unit_size properly, ensuring it's a number
        unit_size: form.unit_size !== undefined 
          ? (typeof form.unit_size === 'string' ? parseFloat(form.unit_size) : form.unit_size) 
          : selectedProduct.unit_size,
        
        unit_type: form.unit_type || selectedProduct.unit_type,
        
        // Preserve product_desc from original product
        product_desc: selectedProduct.product_desc
      };
      
      console.log("Complete form data being sent:", updatedForm);
      console.log("Data types:", {
        product_id: typeof updatedForm.product_id,
        product_name: typeof updatedForm.product_name,
        product_group: typeof updatedForm.product_group,
        unit_size: typeof updatedForm.unit_size,
        unit_type: typeof updatedForm.unit_type
      });
      
      // This is the correct API URL for your setup
      const apiUrl = `/api/product`;
      
      fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm)
      })
        .then(res => {
          console.log("Response status:", res.status);
          
          // Check if there's content in the response
          const contentLength = res.headers.get('content-length');
          const hasContent = contentLength && parseInt(contentLength) > 0;
          
          if (!res.ok) {
            // For error responses
            return res.text().then(text => {
              let errorMessage = `Server returned ${res.status}`;
              
              if (text && text.trim()) {
                try {
                  const errorData = JSON.parse(text);
                  errorMessage += `: ${errorData.error || 'Unknown error'}`;
                  if (errorData.details) {
                    errorMessage += ` (${errorData.details})`;
                  }
                } catch (e) {
                  // If not JSON, use the raw text
                  errorMessage += `: ${text.substring(0, 100)}`;
                }
              }
              
              throw new Error(errorMessage);
            });
          }
          
          // For successful responses
          if (hasContent) {
            return res.text();
          } else {
            // Empty successful response
            return "";
          }
        })
        .then(text => {
          console.log("Save successful");
          
          // Only try to parse if there's actual content
          if (text && text.trim()) {
            try {
              const data = JSON.parse(text);
              console.log("Response data:", data);
            } catch (e) {
              console.log("Response is not valid JSON, but save was successful");
            }
          }
          
          // Update UI state
          setEditMode(false);
          fetchProducts();
        })
        .catch(error => {
          console.error("Save Error:", error);
          alert(`Failed to save changes: ${error.message}`);
        });
    } catch (_error) {
      console.error("Overall save error");
      alert("An unexpected error occurred while saving.");
    }
  };

  // Add new function to handle adding new dropdown options
  const setDropdownOptions = (field: string, newValue: string) => {
    if (field === 'product_group') {
      if (!productGroups.includes(newValue)) {
        setProductGroups(prev => [...prev, newValue]);
      }
    }
    // Add similar handling for other dropdown fields if needed
  };

  // Updated to use the productGroups state for product_group field
  const getDropdownOptions = (field: string): string[] => {
    if (field === 'product_group') {
      return productGroups;
    }
    // For other fields, fallback to the original implementation
    const uniqueOptions = [...new Set(products.map(item => item[field as keyof Product]))];
    return uniqueOptions.filter(option => option) as string[];
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      String(product[searchField as keyof Product])
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <TableFunctions
        // Search props
        searchOptions={searchOptions}
        searchField={searchField}
        setSearchField={setSearchField}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        
        // Data props
        data={filteredProducts}
        columns={columns}
        idField="product_id"
        
        // Selection props
        selectedItem={selectedProduct}
        setSelectedItem={setSelectedProduct}
        
        // Edit props
        editMode={editMode}
        setEditMode={setEditMode}
        form={form}
        setForm={setForm}
        handleFormChange={handleFormChange}
        handleSave={handleSave}
        
        // Dropdown options
        getDropdownOptions={getDropdownOptions}
        setDropdownOptions={setDropdownOptions}
      />
      
      {/* Form Functions */}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={fetchProducts} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center">
          <FaSync className="mr-2" /> Refresh
        </button>
        <button onClick={() => router.push("/product-setup/new")} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
          <FaPlus className="mr-2" /> Add New Product
        </button>
      </div>
    </Layout>
  );
}