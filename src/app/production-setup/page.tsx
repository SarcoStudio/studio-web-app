"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { FaPlus, FaSync } from "react-icons/fa";

// Define the type for production info 
type ProductionInfo = {
  product_id: string;
  product_name: string;
  product_desc: string;
  product_group: string;
  mach_name: string;
  mach_dep: string;
  mach_id: string;
  signal_mult: number;
  production_target: number;
};

// Define the type for shift info
type ShiftInfo = {
  shift_id: number;
  shift_desc: string;
  start_time: string;
  end_time: string;
  spans_next_day: boolean;
};

// Define column type
type Column = {
  field: string;
  header: string;
  editable?: boolean;
  type?: 'dropdown' | 'text' | 'number' | 'time' | 'checkbox';
  inputType?: string;
  renderCell?: (value: any, row: any) => React.ReactNode;
};

// Define tab options
type Tab = 'production' | 'shiftplan';

// Helper function to calculate shift duration
const calculateShiftDuration = (start: string, end: string, spansNextDay: boolean): string => {
  // Create base date objects
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  // Parse times
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  
  // Create date objects for start and end times
  let startDate = new Date(baseDate);
  startDate.setHours(startHours, startMinutes);
  
  let endDate = new Date(baseDate);
  endDate.setHours(endHours, endMinutes);
  
  // If spans next day, add a day to the end time
  if (spansNextDay) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  // Calculate the difference in minutes
  const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
  
  // Format as hours and minutes
  const hours = Math.floor(durationMinutes / 60);
  const minutes = Math.round(durationMinutes % 60);
  
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

export default function ProductionSetupPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('production');
  
  // Production related states
  const [productionData, setProductionData] = useState<ProductionInfo[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<ProductionInfo | null>(null);
  const [productionEditMode, setProductionEditMode] = useState(false);
  const [productionForm, setProductionForm] = useState<Partial<ProductionInfo>>({});
  const [productionError, setProductionError] = useState<string | null>(null);
  const [filteredProductionData, setFilteredProductionData] = useState<ProductionInfo[]>([]);
  const [productionSearchField, setProductionSearchField] = useState('product_id');
  const [productionSearchQuery, setProductionSearchQuery] = useState('');
  
  // Shift related states
  const [shiftData, setShiftData] = useState<ShiftInfo[]>([]);
  const [selectedShift, setSelectedShift] = useState<ShiftInfo | null>(null);
  const [shiftEditMode, setShiftEditMode] = useState(false);
  const [shiftForm, setShiftForm] = useState<Partial<ShiftInfo>>({});
  const [shiftError, setShiftError] = useState<string | null>(null);
  const [filteredShiftData, setFilteredShiftData] = useState<ShiftInfo[]>([]);
  const [shiftSearchField, setShiftSearchField] = useState('shift_desc');
  const [shiftSearchQuery, setShiftSearchQuery] = useState('');
  
  // Dropdown options
  const [productGroups, setProductGroups] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Define production columns
  const productionColumns: Column[] = [
    { field: 'product_id', header: 'Product ID', editable: false },
    { field: 'product_name', header: 'Product Name', editable: true },
    { field: 'product_desc', header: 'Description', editable: true },
    { field: 'product_group', header: 'Product Group', editable: true, type: 'dropdown' },
    { field: 'mach_name', header: 'Machine Name', editable: true },
    { field: 'mach_dep', header: 'Machine Department', editable: true, type: 'dropdown' },
    { field: 'mach_id', header: 'Machine ID', editable: true },
    { field: 'signal_mult', header: 'Signal Multiplier', editable: true, inputType: 'number' },
    { field: 'production_target', header: 'Production Target', editable: true, inputType: 'number' }
  ];

  // Define shift columns with custom rendering
  const shiftColumns: Column[] = [
    { field: 'shift_id', header: 'Shift ID', editable: false },
    { field: 'shift_desc', header: 'Shift Description', editable: true },
    { 
      field: 'start_time', 
      header: 'Start Time', 
      editable: true, 
      inputType: 'time' 
    },
    { 
      field: 'end_time', 
      header: 'End Time', 
      editable: true, 
      inputType: 'time',
      renderCell: (value, row) => (
        <span>
          {value}
          {row.spans_next_day && <span className="ml-1 text-xs text-blue-600">(+1)</span>}
        </span>
      )
    },
    {
      field: 'spans_next_day',
      header: 'Next Day',
      editable: true,
      type: 'checkbox',
      inputType: 'checkbox'
    },
    {
      field: 'duration',
      header: 'Duration',
      editable: false,
      renderCell: (_, row) => (
        <span>
          {calculateShiftDuration(row.start_time, row.end_time, row.spans_next_day)}
        </span>
      )
    }
  ];

  // Production search options
  const productionSearchOptions = [
    { value: 'product_id', label: 'Product ID' },
    { value: 'product_name', label: 'Product Name' },
    { value: 'product_group', label: 'Product Group' },
    { value: 'mach_id', label: 'Machine ID' },
    { value: 'mach_dep', label: 'Department' }
  ];

  // Shift search options
  const shiftSearchOptions = [
    { value: 'shift_id', label: 'Shift ID' },
    { value: 'shift_desc', label: 'Shift Description' }
  ];

  // Initialize production form when edit mode is activated
  useEffect(() => {
    if (selectedProduction && productionEditMode) {
      setProductionForm({...selectedProduction});
    }
  }, [selectedProduction, productionEditMode]);

  // Initialize shift form when edit mode is activated
  useEffect(() => {
    if (selectedShift && shiftEditMode) {
      setShiftForm({...selectedShift});
    }
  }, [selectedShift, shiftEditMode]);

  // Fetch production data
  const fetchProductionInfo = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/production?t=${timestamp}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: ProductionInfo[] = await response.json();
      console.log("Fetched production data:", data);
      setProductionData(data);
      setFilteredProductionData(data);
      setProductionError(null);
      
      // Extract unique dropdown values
      const uniqueGroups = [...new Set(data.map(item => item.product_group))];
      const uniqueDepartments = [...new Set(data.map(item => item.mach_dep))];
      
      setProductGroups(prev => [...new Set([...prev, ...uniqueGroups.filter(g => g)])]);
      setDepartments(prev => [...new Set([...prev, ...uniqueDepartments.filter(d => d)])]);
      
    } catch (error) {
      console.error('Detailed error fetching production info:', error);
      setProductionError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Set fallback data
      const fallbackData: ProductionInfo[] = [
        {
          product_id: 'PROD001',
          product_name: 'Sample Product',
          product_desc: 'A sample product for testing',
          product_group: 'Group A',
          mach_name: 'Machine 1',
          mach_dep: 'Department 1',
          mach_id: 'MACH001',
          signal_mult: 1.5,
          production_target: 100
        }
      ];
      setProductionData(fallbackData);
      setFilteredProductionData(fallbackData);
    }
  }, []);

  // Fetch shift data
  const fetchShiftInfo = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/shift-info?t=${timestamp}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data: ShiftInfo[] = await response.json();
      console.log("Fetched shift data:", data);
      setShiftData(data);
      setFilteredShiftData(data);
      setShiftError(null);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setShiftError(error instanceof Error ? error.message : 'Unknown error');
      
      // Set fallback data
      const fallbackData: ShiftInfo[] = [
        {
          shift_id: 1,
          shift_desc: 'Morning Shift',
          start_time: '06:00:00',
          end_time: '14:00:00',
          spans_next_day: false
        },
        {
          shift_id: 2,
          shift_desc: 'Afternoon Shift',
          start_time: '14:00:00',
          end_time: '22:00:00',
          spans_next_day: false
        },
        {
          shift_id: 3,
          shift_desc: 'Night Shift',
          start_time: '22:00:00',
          end_time: '06:00:00',
          spans_next_day: true
        }
      ];
      setShiftData(fallbackData);
      setFilteredShiftData(fallbackData);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    
    fetchProductionInfo();
    fetchShiftInfo();
    
    // Check URL for tab parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'shiftplan') {
        setActiveTab('shiftplan');
      }
    }
  }, [isAuthenticated, authLoading, fetchProductionInfo, fetchShiftInfo]);

  // Handle production form changes
  const handleProductionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle shift form changes
  const handleShiftFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setShiftForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setShiftForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle production search
  const handleProductionSearch = () => {
    if (!productionSearchQuery.trim()) {
      setFilteredProductionData(productionData);
      return;
    }
    
    const filtered = productionData.filter(item => 
      String(item[productionSearchField as keyof ProductionInfo])
        .toLowerCase()
        .includes(productionSearchQuery.toLowerCase())
    );
    
    setFilteredProductionData(filtered);
  };

  // Handle shift search
  const handleShiftSearch = () => {
    if (!shiftSearchQuery.trim()) {
      setFilteredShiftData(shiftData);
      return;
    }
    
    const filtered = shiftData.filter(item => 
      String(item[shiftSearchField as keyof ShiftInfo])
        .toLowerCase()
        .includes(shiftSearchQuery.toLowerCase())
    );
    
    setFilteredShiftData(filtered);
  };

  // Handle production save
  const handleProductionSave = async () => {
    try {
      if (!selectedProduction) {
        alert("Error: No production record selected");
        return;
      }
      
      const updatedForm = {
        product_id: selectedProduction.product_id,
        ...productionForm
      };
      
      const response = await fetch(`/api/production`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server returned ${response.status}`);
      }
      
      setProductionEditMode(false);
      fetchProductionInfo();
    } catch (error) {
      console.error("Save Error:", error);
      alert(`Failed to save changes: ${error}`);
    }
  };

  // Handle shift save
  const handleShiftSave = async () => {
    try {
      if (!selectedShift) {
        alert("Error: No shift selected");
        return;
      }
      
      const updatedForm = {
        shift_id: selectedShift.shift_id,
        ...shiftForm
      };
      
      const response = await fetch(`/api/shift-info/${selectedShift.shift_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server returned ${response.status}`);
      }
      
      setShiftEditMode(false);
      fetchShiftInfo();
    } catch (error) {
      console.error("Save Error:", error);
      alert(`Failed to save changes: ${error}`);
    }
  };

  // Get production dropdown options
  const getProductionDropdownOptions = (field: string): string[] => {
    switch(field) {
      case 'product_group':
        return productGroups;
      case 'mach_dep':
        return departments;
      default:
        return [];
    }
  };

  // Handle tab change
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Loading state
  if (authLoading) {
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
          <p>Please log in to access production setup.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Production Setup</h1>
      
      {/* Tabs Navigation */}
      <div className="border-b mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'production'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('production')}
            >
              Production
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'shiftplan'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('shiftplan')}
            >
              Shift Plan
            </button>
          </li>
        </ul>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'production' ? (
        <>
          {productionError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{productionError}</span>
            </div>
          )}
          
          {/* Production Search and Table */}
          <div className="bg-white rounded-lg shadow mb-6">
            {/* Search Section */}
            <div className="p-4 border-b">
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Field
                  </label>
                  <select
                    value={productionSearchField}
                    onChange={(e) => setProductionSearchField(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    {productionSearchOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={productionSearchQuery}
                    onChange={(e) => setProductionSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder={`Search by ${productionSearchOptions.find(opt => opt.value === productionSearchField)?.label}`}
                  />
                </div>
                <button
                  onClick={handleProductionSearch}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Production Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {productionColumns.map((column) => (
                      <th
                        key={column.field}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProductionData.map((item) => (
                    <tr
                      key={item.product_id}
                      className={`hover:bg-gray-50 ${selectedProduction?.product_id === item.product_id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedProduction(item)}
                    >
                      {productionColumns.map((column) => (
                        <td key={column.field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {productionEditMode && selectedProduction?.product_id === item.product_id && column.editable ? (
                            column.type === 'dropdown' ? (
                              <select
                                name={column.field}
                                value={productionForm[column.field as keyof ProductionInfo] || ''}
                                onChange={handleProductionFormChange}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                {getProductionDropdownOptions(column.field).map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={column.inputType || 'text'}
                                name={column.field}
                                value={productionForm[column.field as keyof ProductionInfo] || ''}
                                onChange={handleProductionFormChange}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                              />
                            )
                          ) : (
                            item[column.field as keyof ProductionInfo]
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {selectedProduction?.product_id === item.product_id && productionEditMode ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleProductionSave}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setProductionEditMode(false)}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : selectedProduction?.product_id === item.product_id ? (
                          <button
                            onClick={() => setProductionEditMode(true)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Shift Functions */}
          <div className="flex justify-end gap-2">
            <button 
              onClick={fetchShiftInfo} 
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600"
            >
              <FaSync className="mr-2" /> Refresh
            </button>
            <button 
              onClick={() => router.push("/shift-info/new")} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
            >
              <FaPlus className="mr-2" /> Add New Shift
            </button>
          </div>
        </>
      )}
    </div>
  );
}