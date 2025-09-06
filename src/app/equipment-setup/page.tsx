"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { FaPlus, FaSync } from "react-icons/fa";

// Define types for the equipment
type Equipment = {
  unit_id: string;
  gpio_num: string;
  field_id: string;
  mach_id: string;
  mach_dep: string;
  mach_name: string;
  refresh_int: string;
  target_good: string;
  target_acceptable: string;
  target_bad: string;
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

export default function EquipmentSetup() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Equipment>>({});
  const [searchField, setSearchField] = useState("mach_id");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  
  // Dropdown options for departments and field IDs
  const [departments, setDepartments] = useState<string[]>([
    'Department 1', 
    'Department 2', 
    'Department 3'
  ]);
  const [fieldIds, setFieldIds] = useState<string[]>([
    'F01', 'F02', 'F03', 'F04', 'F05', 
    'F06', 'F07', 'F08', 'F09', 'F10', 'F11'
  ]);

  // Define column structure for this specific page
  const columns: Column[] = [
    { 
      field: "mach_id",
      header: "Machine ID", 
      editable: false,
      inputType: "text"
    },
    { 
      field: "unit_id", 
      header: "Unit ID", 
      editable: true,
      inputType: "text"
    },
    { 
      field: "gpio_num", 
      header: "GPIO Number", 
      editable: true,
      inputType: "text"
    },
    { 
      field: "field_id", 
      header: "Field ID", 
      editable: true,
      type: "dropdown"
    },
    { 
      field: "mach_dep", 
      header: "Machine Department", 
      editable: true,
      type: "dropdown"
    },
    { 
      field: "mach_name", 
      header: "Machine Name", 
      editable: true,
      inputType: "text"
    },
    { 
      field: "refresh_int", 
      header: "Refresh Interval", 
      editable: true,
      inputType: "text"
    },
    { 
      field: "target_good", 
      header: "Target Good %", 
      editable: true,
      inputType: "number"
    },
    { 
      field: "target_acceptable", 
      header: "Target Acceptable %", 
      editable: true,
      inputType: "number"
    },
    { 
      field: "target_bad", 
      header: "Target Bad %", 
      editable: true,
      inputType: "number"
    }
  ];

  // Define search options
  const searchOptions: SearchOption[] = [
    { value: "mach_id", label: "Machine ID" },
    { value: "unit_id", label: "Unit ID" },
    { value: "mach_name", label: "Machine Name" },
    { value: "mach_dep", label: "Department" }
  ];

  // Fetch equipment data
  const fetchEquipment = useCallback(() => {
    const timestamp = new Date().getTime();
    fetch(`/api/equipment?t=${timestamp}`)
      .then((res) => res.json())
      .then((data: Equipment[]) => {
        console.log("Fetched equipment:", data);
        setEquipment(data);
        setFilteredEquipment(data);
        
        // Extract unique departments and field IDs
        const uniqueDepartments = [...new Set(data.map(item => item.mach_dep))];
        const uniqueFieldIds = [...new Set(data.map(item => item.field_id))];
        
        setDepartments(prev => [...new Set([...prev, ...uniqueDepartments.filter(d => d)])]);
        setFieldIds(prev => [...new Set([...prev, ...uniqueFieldIds.filter(f => f)])]);
      })
      .catch((error) => console.error("Fetch Equipment Error:", error));
  }, []);

  // Initialize form when edit mode is activated
  useEffect(() => {
    if (selectedEquipment && editMode) {
      setForm({...selectedEquipment});
    }
  }, [selectedEquipment, editMode]);

  // Fetch equipment data when component loads
  useEffect(() => {
    if (isAuthenticated) {
      fetchEquipment();
    }
  }, [isAuthenticated, fetchEquipment]);

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredEquipment(equipment);
      return;
    }
    
    const filtered = equipment.filter(item => 
      String(item[searchField as keyof Equipment])
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    
    setFilteredEquipment(filtered);
  };

  // Handle save
  const handleSave = async () => {
    try {
      console.log("Beginning save process");
      
      if (!selectedEquipment) {
        console.error("No selected equipment");
        alert("Error: No equipment selected");
        return;
      }
      
      const updatedForm = {
        mach_id: selectedEquipment.mach_id,
        ...form
      };
      
      const response = await fetch(`/api/equipment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server returned ${response.status}`);
      }
      
      console.log("Save successful");
      setEditMode(false);
      fetchEquipment();
    } catch (error) {
      console.error("Save Error:", error);
      alert(`Failed to save changes: ${error}`);
    }
  };

  // Get dropdown options
  const getDropdownOptions = (field: string): string[] => {
    switch(field) {
      case 'mach_dep':
        return departments;
      case 'field_id':
        return fieldIds;
      default:
        return [];
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
          <p>Please log in to access equipment setup.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Equipment Setup</h1>
      
      {/* Search Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Field
            </label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {searchOptions.map(option => (
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder={`Search by ${searchOptions.find(opt => opt.value === searchField)?.label}`}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
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
              {filteredEquipment.map((item) => (
                <tr
                  key={item.mach_id}
                  className={`hover:bg-gray-50 ${selectedEquipment?.mach_id === item.mach_id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedEquipment(item)}
                >
                  {columns.map((column) => (
                    <td key={column.field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editMode && selectedEquipment?.mach_id === item.mach_id && column.editable ? (
                        column.type === 'dropdown' ? (
                          <select
                            name={column.field}
                            value={form[column.field as keyof Equipment] || ''}
                            onChange={handleFormChange}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            {getDropdownOptions(column.field).map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={column.inputType || 'text'}
                            name={column.field}
                            value={form[column.field as keyof Equipment] || ''}
                            onChange={handleFormChange}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                          />
                        )
                      ) : (
                        item[column.field as keyof Equipment]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {selectedEquipment?.mach_id === item.mach_id && editMode ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : selectedEquipment?.mach_id === item.mach_id ? (
                      <button
                        onClick={() => setEditMode(true)}
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-6">
        <button 
          onClick={fetchEquipment} 
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600"
        >
          <FaSync className="mr-2" /> Refresh
        </button>
        <button 
          onClick={() => router.push("/equipment-setup/new")} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
        >
          <FaPlus className="mr-2" /> Add New Equipment
        </button>
      </div>
    </div>
  );
}