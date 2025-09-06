"use client";

import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaSearch, FaPlus } from "react-icons/fa";

// More generic type that can accept any item type
type GenericItem = {
  [key: string]: any;
};

type Column = {
  field: string;
  header: string;
  editable?: boolean;
  type?: 'dropdown' | 'text' | 'number' | 'time' | 'checkbox';
  inputType?: string;
  renderCell?: (value: any, row: any) => React.ReactNode;
};

type SearchOption = {
  value: string;
  label: string;
};

type TableFunctionsProps<T extends GenericItem> = {
  searchOptions: SearchOption[];
  searchField: string;
  setSearchField: (field: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  
  data: T[];
  columns: Column[];
  idField: string;
  
  selectedItem: T | null;
  setSelectedItem: (item: T | null) => void;
  
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  form: Partial<T>;
  setForm: (form: Partial<T>) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSave: () => void;
  
  getDropdownOptions: (field: string) => string[];
  setDropdownOptions?: (field: string, value: string) => void;
};

export default function TableFunctions<T extends GenericItem>({
  searchOptions,
  searchField,
  setSearchField,
  searchQuery,
  setSearchQuery,
  handleSearch,
  
  data,
  columns,
  idField,
  
  selectedItem,
  setSelectedItem,
  
  editMode,
  setEditMode,
  form,
  setForm,
  handleFormChange,
  handleSave,
  
  getDropdownOptions,
  setDropdownOptions = undefined,
}: TableFunctionsProps<T>) {
  const [newOptionValues, setNewOptionValues] = useState<{[key: string]: string}>({});
  const [addingNewFor, setAddingNewFor] = useState<string | null>(null);

  // Helper function to ensure form values are always defined
  const getFormValue = (field: string, type?: string): any => {
    // For checkboxes, default to false
    if (type === 'checkbox') {
      return form[field] === true;
    }
    
    // For text inputs, default to empty string
    return form[field] !== undefined ? form[field] : '';
  };

  // Handle adding a new dropdown option
  const handleAddNewOption = (field: string) => {
    if (newOptionValues[field] && newOptionValues[field].trim() !== "") {
      const newValue = newOptionValues[field].trim();
      
      // Add the new option to the dropdown options list if function exists
      if (typeof setDropdownOptions === 'function') {
        setDropdownOptions(field, newValue);
      } else {
        console.warn(`No setDropdownOptions function provided for field ${field}`);
      }
      
      // Update the form with the new value
      const newForm = { ...form, [field]: newValue };
      setForm(newForm);
      
      // Clear the new option value and reset state
      setNewOptionValues({ ...newOptionValues, [field]: "" });
      setAddingNewFor(null);
    }
  };

  // Custom change handler for dropdown fields
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (value === "__add_new__") {
      // Set the adding new state for this field
      setAddingNewFor(name);
      // Initialize the new option value field
      setNewOptionValues({ ...newOptionValues, [name]: "" });
    } else {
      // Normal update
      setForm({ ...form, [name]: value });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <>
      <style jsx>{`
        .edit-row { background-color: lightgray; border: 2px solid gray; }
        .edit-field { border: 2px solid gray; padding: 2px; }
        .edit-field:focus { border: 2px solid blue; }
        .disabled-row { background-color: rgba(200, 200, 200, 0.5); pointer-events: none; opacity: 0.6; }
        .dropdown-container { position: relative; }
        .new-option-container { display: flex; gap: 4px; margin-top: 4px; }
        .selected-row { background-color: rgba(59, 130, 246, 0.2); }
        .clickable-row { cursor: pointer; }
        .clickable-row:hover { background-color: rgba(59, 130, 246, 0.1); }
      `}</style>
      <div className="grid grid-cols-3 gap-4 w-full mb-4">
        <div className="col-span-1"></div>
        <div className="col-span-1"></div>
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <select 
              onChange={(e) => setSearchField(e.target.value)} 
              className="px-4 py-2 border rounded-lg"
              value={searchField}
            >
              {searchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="px-4 py-2 border rounded-lg" 
              placeholder="Search..." 
            />
            <button 
              onClick={handleSearch} 
              className="bg-blue-500 text-white px-2 py-2 rounded-lg flex items-center"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Buttons above the table */}
      <div className="flex justify-end gap-2 mb-4">
        <button 
          onClick={() => {
            if (selectedItem) {
              // Make a complete copy with initialized values for all fields
              const initializedForm: Partial<T> = {};
              columns.forEach(column => {
                // Initialize each editable field with appropriate default
                if (column.editable) {
                  const fieldName = column.field;
                  const fieldValue = selectedItem[fieldName];
                  
                  if (column.type === 'checkbox') {
                    initializedForm[fieldName] = !!fieldValue; // Ensure boolean
                  } else {
                    initializedForm[fieldName] = fieldValue !== undefined ? fieldValue : '';
                  }
                }
              });

              // Add non-editable key fields
              initializedForm[idField] = selectedItem[idField];
              
              setForm(initializedForm);
              setEditMode(true);
              setNewOptionValues({});
              setAddingNewFor(null);
            }
          }} 
          disabled={!selectedItem} 
          className={`px-4 py-2 rounded-lg flex items-center ${
            selectedItem ? "bg-yellow-500 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          <FaEdit className="mr-2" /> Edit
        </button>
        <button 
          onClick={handleSave} 
          disabled={!editMode} 
          className={`px-4 py-2 rounded-lg flex items-center ${
            editMode ? "bg-green-500 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          <FaSave className="mr-2" /> Save
        </button>
        <button 
          onClick={() => {
            setEditMode(false);
            setNewOptionValues({});
            setAddingNewFor(null);
          }} 
          disabled={!editMode} 
          className={`px-4 py-2 rounded-lg flex items-center ${
            editMode ? "bg-red-500 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          <FaTimes className="mr-2" /> Cancel
        </button>
      </div>
      
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-200">
          <tr className="h-12">
            {!editMode && <th className="w-12 border border-gray-300"></th>}
            {columns.map((column) => (
              <th 
                key={column.field} 
                className="border border-gray-300 px-4 py-2"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            // Check if this row is selected
            const isSelected = selectedItem && String(selectedItem[idField]) === String(item[idField]);
            
            // Determine row class
            let rowClass = "";
            if (editMode) {
              if (isSelected) {
                rowClass = "edit-row";
              } else {
                rowClass = "disabled-row";
              }
            } else if (isSelected) {
              rowClass = "selected-row";
            } else {
              rowClass = "clickable-row";
            }
            
            return (
              <tr 
                key={`${String(item[idField])}-${index}`} 
                className={rowClass}
                onClick={() => !editMode && setSelectedItem(item)}
              >
                {!editMode && (
                  <td className="w-12 h-12 border border-gray-300 flex justify-center items-center">
                    <input 
                      type="radio" 
                      name="selected" 
                      checked={isSelected || false} 
                      onChange={() => setSelectedItem(item)} 
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {columns.map((column) => (
                  <td key={column.field} className="border border-gray-300 px-4 py-2">
                    {editMode && isSelected && column.editable ? (
                      <div className="dropdown-container">
                        {column.type === "dropdown" ? (
                          addingNewFor === column.field ? (
                            // Show input field when adding new option
                            <div className="new-option-container">
                              <input
                                type="text"
                                placeholder={`New ${column.header}`}
                                value={newOptionValues[column.field] || ""}
                                onChange={(e) => 
                                  setNewOptionValues({
                                    ...newOptionValues,
                                    [column.field]: e.target.value
                                  })
                                }
                                className="edit-field w-full"
                                autoFocus
                              />
                              <button
                                onClick={() => handleAddNewOption(column.field)}
                                className="bg-green-500 text-white px-2 py-1 rounded"
                              >
                                <FaPlus />
                              </button>
                              <button
                                onClick={() => {
                                  setAddingNewFor(null);
                                }}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            // Show dropdown when not adding new
                            <select
                              name={column.field}
                              value={getFormValue(column.field)}
                              onChange={handleDropdownChange}
                              className="edit-field w-full"
                            >
                              <option value="">Select {column.header}</option>
                              {getDropdownOptions(column.field).map((option, optIndex) => (
                                <option key={`${column.field}-${option}-${optIndex}`} value={option}>
                                  {option}
                                </option>
                              ))}
                              <option value="__add_new__">+ Add New</option>
                            </select>
                          )
                        ) : column.type === "checkbox" ? (
                          <input 
                            type="checkbox" 
                            name={column.field} 
                            checked={getFormValue(column.field, 'checkbox')} 
                            onChange={handleCheckboxChange} 
                            className="h-4 w-4" 
                          />
                        ) : (
                          <input 
                            type={column.inputType || "text"} 
                            name={column.field} 
                            value={getFormValue(column.field)}
                            onChange={handleFormChange} 
                            className="edit-field w-full" 
                          />
                        )}
                      </div>
                    ) : (
                      // Use custom cell renderer if available, otherwise show the raw value
                      column.renderCell ? (
                        column.renderCell(item[column.field], item)
                      ) : (
                        column.type === "checkbox" ? (
                          <input 
                            type="checkbox" 
                            checked={item[column.field] || false} 
                            disabled
                            className="h-4 w-4" 
                          />
                        ) : (
                          item[column.field]
                        )
                      )
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}