"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export function UserDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const username = user?.username || 'User';
  const userInitials = username.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-2 bg-[#A0A5B0] text-[#0C0C0C] px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {userInitials}
        </div>
        
        {/* Username */}
        <span className="text-sm font-medium">{username}</span>
        
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg border border-gray-200 py-1 z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{username}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
          
          {/* Menu Items */}
          <div className="py-1">
            <button 
              onClick={() => {
                setIsOpen(false);
                // Add profile/settings navigation here
              }}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              Profile Settings
            </button>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                // Add preferences navigation here
              }}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              Preferences
            </button>
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <button 
              onClick={handleSignOut}
              className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}