"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { FaSync, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";

// Types for monitoring data
interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
}

interface ProductionStatus {
  machineId: string;
  machineName: string;
  status: 'active' | 'idle' | 'maintenance' | 'error';
  currentProduction: number;
  targetProduction: number;
  efficiency: number;
  lastUpdate: string;
}

export default function Monitoring() {
  const { isAuthenticated, isLoading } = useAuth();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [productionStatus, setProductionStatus] = useState<ProductionStatus[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data - replace with actual API calls
  const generateMockData = useCallback(() => {
    // Mock system metrics
    const mockMetrics: SystemMetric[] = [
      {
        id: '1',
        name: 'CPU Usage',
        value: Math.random() * 100,
        unit: '%',
        status: Math.random() > 0.8 ? 'warning' : 'good',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Memory Usage',
        value: Math.random() * 100,
        unit: '%',
        status: Math.random() > 0.9 ? 'critical' : 'good',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Network Latency',
        value: Math.random() * 100 + 10,
        unit: 'ms',
        status: Math.random() > 0.7 ? 'warning' : 'good',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Active Connections',
        value: Math.floor(Math.random() * 50) + 10,
        unit: 'connections',
        status: 'good',
        lastUpdated: new Date().toISOString()
      }
    ];

    // Mock alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High CPU Usage',
        message: 'CPU usage has exceeded 80% on production server',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        source: 'Production Server',
        acknowledged: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Maintenance Scheduled',
        message: 'Scheduled maintenance for Machine A-001 at 2:00 AM',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        source: 'Maintenance System',
        acknowledged: true
      },
      {
        id: '3',
        type: 'critical',
        title: 'Equipment Failure',
        message: 'Machine B-003 has stopped responding',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        source: 'Machine B-003',
        acknowledged: false
      }
    ];

    // Mock production status
    const mockProduction: ProductionStatus[] = [
      {
        machineId: 'A-001',
        machineName: 'Assembly Line A',
        status: 'active',
        currentProduction: Math.floor(Math.random() * 100) + 50,
        targetProduction: 120,
        efficiency: Math.random() * 30 + 70,
        lastUpdate: new Date().toISOString()
      },
      {
        machineId: 'B-003',
        machineName: 'Packaging Unit B',
        status: Math.random() > 0.5 ? 'active' : 'idle',
        currentProduction: Math.floor(Math.random() * 80) + 20,
        targetProduction: 100,
        efficiency: Math.random() * 25 + 75,
        lastUpdate: new Date().toISOString()
      },
      {
        machineId: 'C-002',
        machineName: 'Quality Control C',
        status: 'maintenance',
        currentProduction: 0,
        targetProduction: 60,
        efficiency: 0,
        lastUpdate: new Date().toISOString()
      }
    ];

    setSystemMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setProductionStatus(mockProduction);
    setLastRefresh(new Date());
  }, []);

  // Initialize data and set up auto-refresh
  useEffect(() => {
    if (isAuthenticated) {
      generateMockData();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(generateMockData, 30000);
      setRefreshInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [isAuthenticated, generateMockData]);

  const handleManualRefresh = () => {
    generateMockData();
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'idle':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info':
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaClock className="text-gray-500" />;
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
          <p>Please log in to access system monitoring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={handleManualRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
          >
            <FaSync className="mr-2" /> Refresh
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics.map((metric) => (
            <div key={metric.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{metric.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value.toFixed(1)} {metric.unit}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Status */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Production Status</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productionStatus.map((machine) => (
                  <tr key={machine.machineId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{machine.machineName}</div>
                        <div className="text-sm text-gray-500">{machine.machineId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(machine.status)}`}>
                        {machine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {machine.currentProduction} / {machine.targetProduction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{machine.efficiency.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(machine.efficiency, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(machine.lastUpdate).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Alerts</h2>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              No active alerts
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border ${
                  alert.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-white border-l-4'
                } ${
                  alert.type === 'critical' ? 'border-l-red-500' :
                  alert.type === 'warning' ? 'border-l-yellow-500' :
                  alert.type === 'info' ? 'border-l-blue-500' : 'border-l-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Source: {alert.source}</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}