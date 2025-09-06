"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { FaArrowLeft, FaPlay, FaSync } from 'react-icons/fa';

// Type definitions
type Department = string;

type Machine = {
  mach_id: string;
  mach_name: string;
  mach_dep: string;
};

type Shift = {
  shift_id: number;
  shift_desc: string;
  start_time: string;
  end_time: string;
  spans_next_day: boolean;
};

type Product = {
  product_id: string;
  product_name: string;
  product_desc: string;
  product_group: string;
  mach_name: string;
  mach_id: string;
};

export default function ProductionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation states
  const departmentParam = searchParams.get('department');
  const machineParam = searchParams.get('machine');
  
  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filtered data
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Form state
  const [productionForm, setProductionForm] = useState({
    shift_id: '',
    product_id: '',
    quantity: '100',
    notes: ''
  });

  // Add helper functions for handling shift times
  const isShiftActive = (shift: Shift): boolean => {
    const now = new Date();
    
    // Parse shift times
    const [startHours, startMinutes] = shift.start_time.split(':').map(Number);
    const [endHours, endMinutes] = shift.end_time.split(':').map(Number);
    
    // Create start and end Date objects for today
    let startTime = new Date(now);
    startTime.setHours(startHours, startMinutes, 0, 0);
    
    let endTime = new Date(now);
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    // Handle shifts that span to the next day
    if (shift.spans_next_day) {
      // If end time is earlier than start time, it must be on the next day
      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
      
      // If we're past midnight and before the end time, the start time might be from yesterday
      if (now.getHours() < endHours && startTime > now) {
        startTime.setDate(startTime.getDate() - 1);
      }
    }
    
    // The shift is active if the current time is between start and end times
    return now >= startTime && now < endTime;
  };
  
  // Render colored indicators for shift status
  const renderShiftStatus = (shift: Shift): React.ReactNode => {
    if (isShiftActive(shift)) {
      return <span className="ml-2 inline-block w-3 h-3 bg-green-500 rounded-full" title="Active shift" />;
    } else {
      return <span className="ml-2 inline-block w-3 h-3 bg-gray-400 rounded-full" title="Inactive shift" />;
    }
  };

  // Handle department selection
  const handleDepartmentClick = (department: string) => {
    router.push(`/production?department=${encodeURIComponent(department)}`);
  };

  // Fetch data based on the current view
  useEffect(() => {
    // Only fetch data if authenticated
    if (!isAuthenticated || authLoading) return;
    
    // Set loading state
    setIsLoading(true);
    
    // Define an async function to fetch all required data
    const fetchAllData = async () => {
      try {
        // Always fetch machine data first to get departments
        const machinesResponse = await fetch('/api/equipment');
        
        if (!machinesResponse.ok) {
          throw new Error('Failed to fetch machine data');
        }
        
        const machinesData: Machine[] = await machinesResponse.json();
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(machinesData
          .map(machine => machine.mach_dep)
          .filter(dep => dep && dep.trim() !== '')
        )];
        
        setDepartments(uniqueDepartments);
        setMachines(machinesData);
        
        // Filter machines if department is selected
        if (departmentParam) {
          const machinesInDepartment = machinesData.filter(
            machine => machine.mach_dep === departmentParam
          );
          setFilteredMachines(machinesInDepartment);
          
          // Fetch shifts data if we're at department level or further
          const shiftsResponse = await fetch('/api/shift-info');
          
          if (shiftsResponse.ok) {
            const shiftsData: Shift[] = await shiftsResponse.json();
            setShifts(shiftsData);
          }
        }
        
        // If machine is selected, check if it has a running production and redirect if needed
        if (machineParam) {
          // First, check if there's a running production for this machine
          const currentProductionResponse = await fetch('/api/production-data');
          
          if (currentProductionResponse.ok) {
            const allProductions = await currentProductionResponse.json();
            
            // Find if this machine has any running production
            const selectedMachine = machinesData.find(m => m.mach_id === machineParam);
            console.log("Selected machine:", selectedMachine);
            console.log("All productions:", allProductions);
            
            const runningProduction = allProductions.find((prod: any) => {
              // Check specifically for this machine
              const machineMatches = prod.mach_id === machineParam || 
                                    (selectedMachine && prod.mach_name === selectedMachine.mach_name);
              
              return machineMatches && prod.status === 'running';
            });
            
            if (runningProduction) {
              // If there's a running production, redirect to the production screen
              console.log("Found running production, redirecting to production screen", runningProduction.id);
              router.push(`/production-screen/${runningProduction.id}`);
              return; // Don't continue with the rest of the data fetching
            }
          }
          
          // If no running production, fetch products for the form
          const productsResponse = await fetch('/api/production');
          
          if (productsResponse.ok) {
            const productsData: Product[] = await productsResponse.json();
            
            // Filter products that are associated with this machine
            const machineProducts = productsData.filter(product => 
              (product.mach_id && product.mach_id === machineParam) || 
              (product.mach_name && product.mach_name === machinesData.find(m => m.mach_id === machineParam)?.mach_name)
            );
            
            setProducts(productsData);
            setFilteredProducts(machineProducts);
          }
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // Set mock data for development if needed
        if (process.env.NODE_ENV === 'development') {
          const mockDepartments = ['Milling', 'Packaging', 'Processing'];
          const mockMachines = [
            { mach_id: 'MILL-F01', mach_name: 'Flour Mill 1', mach_dep: 'Milling' },
            { mach_id: 'MILL-F02', mach_name: 'Flour Mill 2', mach_dep: 'Milling' },
            { mach_id: 'PKG-001', mach_name: 'Packaging Line 1', mach_dep: 'Packaging' },
            { mach_id: 'PKG-002', mach_name: 'Packaging Line 2', mach_dep: 'Packaging' },
            { mach_id: 'PROC-01', mach_name: 'Food Processor 1', mach_dep: 'Processing' },
          ];
          
          setDepartments(mockDepartments);
          setMachines(mockMachines);
          
          if (departmentParam) {
            setFilteredMachines(mockMachines.filter(
              machine => machine.mach_dep === departmentParam
            ));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, [isAuthenticated, authLoading, departmentParam, machineParam, router]);

  // Handle machine selection
  const handleMachineClick = (machine: Machine) => {
    router.push(`/production?department=${encodeURIComponent(machine.mach_dep)}&machine=${encodeURIComponent(machine.mach_id)}`);
  };

  // Handle back button
  const handleBack = () => {
    if (machineParam) {
      // Go back to department view
      router.push(`/production?department=${encodeURIComponent(departmentParam || '')}`);
    } else if (departmentParam) {
      // Go back to main departments view
      router.push('/production');
    }
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleStartProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productionForm.shift_id || !productionForm.product_id) {
      setError('Please select a shift and product');
      return;
    }
    
    try {
      // Set loading to prevent multiple submissions
      setIsLoading(true);
      
      // Get selected product and shift information
      const selectedProduct = filteredProducts.find(p => p.product_id === productionForm.product_id);
      const selectedShift = shifts.find(s => s.shift_id === parseInt(productionForm.shift_id));
      const selectedMachine = machines.find(m => m.mach_id === machineParam);
      
      if (!selectedProduct || !selectedShift || !selectedMachine) {
        throw new Error('Could not find the selected product, shift, or machine');
      }
      
      // Calculate end_time based on shift information
      const now = new Date();
      const [startHours, startMinutes] = selectedShift.start_time.split(':').map(Number);
      const [endHours, endMinutes] = selectedShift.end_time.split(':').map(Number);
      
      // Create start and end time Date objects
      let startDateTime = new Date(now);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      let endDateTime = new Date(now);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // Adjust for shifts that span into the next day
      if (selectedShift.spans_next_day) {
        // If current time is past the end time, then the shift end time is in the next day
        if (endDateTime <= now) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        // If the end time is less than the start time, it means the shift spans to the next day
        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
      }
      
      // Get current user
      let username = 'Unknown';
      try {
        const { user } = useAuth();
        username = user?.username || 'Unknown';
      } catch (error) {
        console.error("Error getting current user:", error);
      }
      
      // Determine initial status based on current time vs. shift end time
      const status = now >= endDateTime ? 'finished' : 'running';
      
      // Send the production data to the backend
      const response = await fetch('/api/production-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: username,
          mach_dep: selectedMachine.mach_dep,
          mach_name: selectedMachine.mach_name,
          shift_plan: selectedShift.shift_desc,
          prod_id: selectedProduct.product_id,
          prod_name: selectedProduct.product_name,
          notes: productionForm.notes,
          end_time: endDateTime.toISOString(),
          status: status
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: Failed to start production`);
      }
      
      // Get the created production record
      const productionRecord = await response.json();
      console.log("Created new production:", productionRecord);
      
      // Reset form
      setProductionForm({
        shift_id: '',
        product_id: '',
        quantity: '100',
        notes: ''
      });
      
      // If status is running, redirect to production screen, otherwise go back to department view
      if (status === 'running') {
        console.log("Redirecting to production screen for new production:", productionRecord.id);
        // Add a small delay to ensure state updates have processed
        setTimeout(() => {
          router.push(`/production-screen/${productionRecord.id}`);
        }, 100);
      } else {
        // Show success message for finished status
        alert(`Production recorded as finished for ${selectedProduct.product_name} on ${selectedMachine.mach_name}`);
        router.push(`/production?department=${encodeURIComponent(departmentParam || '')}`);
      }
      
    } catch (err) {
      console.error("Error starting production:", err);
      setError(err instanceof Error ? err.message : 'Failed to start production');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (authLoading || (!isAuthenticated && !authLoading)) {
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
          <p>Please log in to access production management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {(departmentParam || machineParam) && (
            <button 
              onClick={handleBack}
              className="mr-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              <FaArrowLeft />
            </button>
          )}
          <h1 className="text-2xl font-bold">
            {machineParam 
              ? `Setup Production: ${machines.find(m => m.mach_id === machineParam)?.mach_name || 'Loading...'}`
              : departmentParam
                ? `Select Machine in ${departmentParam}`
                : 'Select Department'
            }
          </h1>
        </div>
        <button 
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : <><FaSync className="mr-2" /> Refresh</>}
        </button>
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Department Selection View */}
          {!departmentParam && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No departments found. Please set up departments in Equipment Setup.
                </div>
              ) : (
                departments.map(department => (
                  <button
                    key={department}
                    onClick={() => handleDepartmentClick(department)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-lg shadow-md text-xl font-semibold transition-colors"
                  >
                    {department}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Machine Selection View */}
          {departmentParam && !machineParam && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachines.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No machines found in this department. Please add machines in Equipment Setup.
                </div>
              ) : (
                filteredMachines.map(machine => (
                  <button
                    key={machine.mach_id}
                    onClick={() => handleMachineClick(machine)}
                    className="bg-green-600 hover:bg-green-700 text-white p-8 rounded-lg shadow-md text-xl font-semibold transition-colors"
                  >
                    {machine.mach_name}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Production Setup View */}
          {departmentParam && machineParam && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold">Production Setup</h2>
              </div>
              <form onSubmit={handleStartProduction} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shift Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Shift
                    </label>
                    <select
                      name="shift_id"
                      value={productionForm.shift_id}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a shift</option>
                      {shifts.map(shift => {
                        const active = isShiftActive(shift);
                        return (
                          <option key={shift.shift_id} value={shift.shift_id}>
                            {shift.shift_desc} ({shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)})
                            {shift.spans_next_day ? ' +1 day' : ''} {active ? '(Active)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <p className="mt-1 text-xs text-gray-600">
                      Note: If you select a completed shift, the status will automatically be set to "finished".
                    </p>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Product
                    </label>
                    <select
                      name="product_id"
                      value={productionForm.product_id}
                      onChange={handleFormChange}
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
                        No products found for this machine. Please assign products in Production Setup.
                      </p>
                    )}
                  </div>

                  {/* Production Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Production Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={productionForm.quantity}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Production Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={productionForm.notes}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center font-semibold"
                    disabled={filteredProducts.length === 0}
                  >
                    <FaPlay className="mr-2" /> Start Production
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}