"use client";
import React from "react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome to Sarco Studio</h1>
        <p className="text-blue-100">Production Management System - Monitor, control, and optimize your manufacturing operations</p>
      </div>

      {/* Operations Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/production" className="block p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🏭</span>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">Production</h3>
              <p className="text-sm text-gray-600 mt-2">Monitor active production lines and processes</p>
              <div className="mt-4 text-sm text-gray-500 hover:text-gray-700">Click to access →</div>
            </Link>

            <Link href="/monitoring" className="block p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📊</span>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">Monitoring</h3>
              <p className="text-sm text-gray-600 mt-2">Real-time system monitoring and alerts</p>
              <div className="mt-4 text-sm text-gray-500 hover:text-gray-700">Click to access →</div>
            </Link>

            <Link href="/reports" className="block p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📈</span>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">Reports</h3>
              <p className="text-sm text-gray-600 mt-2">Generate and view production reports</p>
              <div className="mt-4 text-sm text-gray-500 hover:text-gray-700">Click to access →</div>
            </Link>
          </div>
        </div>
        
        {/* System Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">System Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/equipment-setup" className="block p-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">⚙️</span>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">Equipment Setup</h3>
              <p className="text-sm text-gray-600 mt-2">Configure and manage production equipment</p>
              <div className="mt-4 text-sm text-gray-500 hover:text-gray-700">Click to access →</div>
            </Link>

            <Link href="/product-setup" className="block p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📦</span>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">Product Setup</h3>
              <p className="text-sm text-gray-600 mt-2">Define products and specifications</p>
              <div className="mt-4 text-sm text-gray-500 hover:text-gray-700">Click to access →</div>
            </Link>

            <Link href="/production-setup" className="block p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🔧</span>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">Production Setup</h3>
              <p className="text-sm text-gray-600 mt-2">Configure production parameters</p>
              <div className="mt-4 text-sm text-gray-500 hover:text-gray-700">Click to access →</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}