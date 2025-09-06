"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';

// Define the types needed
type ProductionData = {
  id: number;
  user_id: string;
  mach_dep: string;
  mach_name: string;
  shift_plan: string;
  prod_id: string;
  prod_name: string;
  start_time: string;
  end_time: string | null;
  status: string;
  notes: string | null;
  qty_goal: number | null;
  qty_achieved: number | null;
};

type Product = {
  product_id: string;
  product_name: string;
  product_desc: string;
  product_group: string;
};

export default function ProductionChange() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProduction, setCurrentProduction] = useState<ProductionData | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // New states for quantity achieved and goal
  const [qtyAchieved, setQtyAchieved] = useState<string>('');
  const [qtyGoal, setQtyGoal] = useState<string>('100');

  // Get production ID from URL params
  const productionId = params.id as string;
  
  // Fetch current production data and available products
  useEffect(() => {
    if (!productionId || !isAuthenticated || authLoading) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch current production data
        const productionResponse = await fetch(`/api/production-data/${productionId}`);
        
        if (!productionResponse.ok) {
          throw new Error(`Failed to fetch production data (Status: ${productionResponse.status})`);
        }
        
        const productionData = await productionResponse.json();
        setCurrentProduction(productionData);
        
        // Pre-populate the achieved quantity field if available
        if (productionData.qty_achieved !== null) {
          setQtyAchieved(String(productionData.qty_achieved));
        }
        
        // Fetch available products that can be used with this machine
        const productsResponse = await fetch('/api/production');
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          
          // Filter products that are associated with this machine
          const machineProducts = productsData.filter((product: any) => 
            product.mach_name === productionData.mach_name || 
            product.mach_id === productionData.mach_id
          );
          
          setAvailableProducts(machineProducts);
        }
        
      } catch (error) {
        console.error("Error:", error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [productionId, isAuthenticated, authLoading]);

  // Handle product selection
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  // Handle quantity achieved change
  const handleQtyAchievedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setQtyAchieved(value);
  };
  
  // Handle quantity goal change
  const handleQtyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setQtyGoal(value);
  };

  // Filter the products based on search input
  const filteredProducts = availableProducts.filter(product => 
    product.product_name.toLowerCase().includes(productFilter.toLowerCase()) ||
    product.product_id.toLowerCase().includes(productFilter.toLowerCase())
  );

  // Handle changing product
  const handleChangeProduct = async () => {
    if (!selectedProductId || !currentProduction) {
      setError('Please select a product');
      return;
    }
    
    // Validate achieved quantity is provided
    if (!qtyAchieved.trim()) {
      setError('Please enter the quantity produced for the current product before changing');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Update current production to finished status with explicit end time in UTC
      const now = new Date();
      const stopResponse = await fetch(`/api/production-data/${currentProduction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentProduction.id,
          status: 'finished',
          end_time: now.toISOString(), // Use ISO string for UTC time
          qty_achieved: parseInt(qtyAchieved),
          notes: currentProduction.notes ? 
            `${currentProduction.notes} - Changed to ${selectedProductId}` : 
            `Changed to ${selectedProductId}`
        }),
      });
      
      if (!stopResponse.ok) {
        const errorData = await stopResponse.json();
        throw new Error(errorData.error || 'Failed to finish current production');
      }
      
      // Get the selected product details
      const selectedProduct = availableProducts.find(p => p.product_id === selectedProductId);
      
      if (!selectedProduct) {
        throw new Error('Selected product not found');
      }
      
      // 2. Start a new production with the new product
      const username = user?.username || 'Unknown';
      
      const startResponse = await fetch('/api/production-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: username,
          mach_dep: currentProduction.mach_dep,
          mach_name: currentProduction.mach_name,
          shift_plan: currentProduction.shift_plan,
          prod_id: selectedProduct.product_id,
          prod_name: selectedProduct.product_name,
          notes: notes || `Changed from ${currentProduction.prod_name}`,
          status: 'running',
          quantity: parseInt(qtyGoal) || 100
          // Do not include end_time here
        }),
      });
      
      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || 'Failed to start new production');
      }
      
      const newProductionData = await startResponse.json();
      console.log("Created new production after change:", newProductionData);
      
      // 3. Redirect to the new production screen
      setTimeout(() => {
        router.push(`/production-screen/${newProductionData.id}`);
      }, 100);
      
    } catch (error) {
      console.error("Error changing product:", error);
      setError(error instanceof Error ? error.message : 'Failed to change product');
      setIsLoading(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
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
          <p>Please log in to change production settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">
            Change Product
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="float-right font-bold"
          >
            &times;
          </button>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Change Product for {currentProduction?.mach_name}</h2>
        </div>
        
        <div className="p-6">
          {/* Current Production Info */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Current Production</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Machine:</p>
                <p className="font-semibold">{currentProduction?.mach_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Product:</p>
                <p className="font-semibold">{currentProduction?.prod_name} ({currentProduction?.prod_id})</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shift:</p>
                <p className="font-semibold">{currentProduction?.shift_plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Started:</p>
                <p className="font-semibold">
                  {currentProduction?.start_time && new Date(currentProduction.start_time).toLocaleString()}
                </p>
              </div>
              
              {/* Production Goal */}
              <div>
                <p className="text-sm text-gray-600">Production Goal:</p>
                <p className="font-semibold">
                  {currentProduction?.qty_goal || 'Not set'} units
                </p>
              </div>
            </div>
          </div>
          
          {/* Quantity Achieved Input - Required before changing products */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Quantity Produced</h3>
            <p className="text-sm text-gray-600 mb-2">
              Enter the quantity produced for the current product before changing:
            </p>
            <input
              type="number"
              value={qtyAchieved}
              onChange={handleQtyAchievedChange}
              placeholder="Enter quantity produced"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* Product Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Select New Product</h3>
            
            {/* Search/Filter Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <input
                type="text"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                placeholder="Type to filter products..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Product Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Product
              </label>
              <select
                value={selectedProductId}
                onChange={handleProductChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a product</option>
                {filteredProducts.map(product => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name} ({product.product_id})
                  </option>
                ))}
              </select>
              
              {filteredProducts.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  No products found matching your search.
                </p>
              )}
            </div>
            
            {/* New Production Goal */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Production Goal
              </label>
              <input
                type="number"
                value={qtyGoal}
                onChange={handleQtyGoalChange}
                placeholder="Enter production goal"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Notes Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add any notes about the product change..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleChangeProduct}
              disabled={!selectedProductId || !qtyAchieved || isLoading}
              className={`px-6 py-3 rounded-lg flex items-center font-semibold ${
                !selectedProductId || !qtyAchieved || isLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <FaPlay className="mr-2" /> 
              {isLoading ? 'Changing...' : 'Change to Selected Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}