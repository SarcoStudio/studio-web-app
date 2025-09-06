"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { FaArrowLeft, FaPlay, FaCheck } from 'react-icons/fa';

// Define types for production data
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

export default function ProductionScreen() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [productionData, setProductionData] = React.useState<ProductionData | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState<string>('00:00:00');
  const [counters, setCounters] = React.useState({
    totalCount: 0,
    goodCount: 0,
    badCount: 0
  });
  
  // Local state for tracking achieved quantity
  const [achievedQty, setAchievedQty] = React.useState<number>(0);
  
  // Store shift end time information
  const [shiftEndTime, setShiftEndTime] = React.useState<Date | null>(null);
  // Track if shift has already been auto-completed
  const [autoCompleted, setAutoCompleted] = React.useState<boolean>(false);

  // Get production ID from URL params
  const productionId = params.id as string;

  // Check authentication and fetch data
  React.useEffect(() => {
    // Skip if we don't have a production ID yet or not authenticated
    if (!productionId || !isAuthenticated || authLoading) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch production data using the id
        const response = await fetch(`/api/production-data/${productionId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch production data (Status: ${response.status})`);
        }
        
        const data = await response.json();
        setProductionData(data);
        
        // Initialize achieved quantity from database if available
        if (data.qty_achieved !== null) {
          setAchievedQty(data.qty_achieved);
        } else if (data.status === 'running') {
          // Start with 0 if running and no qty_achieved set
          setAchievedQty(0);
        }
        
        // Fetch shift information to get end time
        if (data.shift_plan) {
          const shiftsResponse = await fetch('/api/shift-info');
          if (shiftsResponse.ok) {
            const shiftsData = await shiftsResponse.json();
            const currentShift = shiftsData.find((shift: any) => 
              shift.shift_desc === data.shift_plan
            );
            
            if (currentShift) {
              // Calculate the shift end time
              const now = new Date();
              const [endHours, endMinutes] = currentShift.end_time.split(':').map(Number);
              
              let endTime = new Date(now);
              endTime.setHours(endHours, endMinutes, 0, 0);
              
              // If the shift spans to the next day and the end time is earlier than now
              if (currentShift.spans_next_day && endTime < now) {
                endTime.setDate(endTime.getDate() + 1);
              }
              
              // If calculated end time is still in the past
              if (endTime < now) {
                // This means the shift already ended
                if (data.status === 'running') {
                  // Auto-complete the production if still running
                  autoFinishProduction(endTime);
                  setAutoCompleted(true);
                }
              }
              
              setShiftEndTime(endTime);
            }
          }
        }
        
        // Initialize counters
        setCounters({
          totalCount: data.qty_achieved || 0,
          goodCount: data.qty_achieved || 0,
          badCount: 0
        });
        
      } catch (error) {
        console.error("Error:", error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [productionId, isAuthenticated, authLoading]);

  // Timer for elapsed time and auto-finish check
  React.useEffect(() => {
    if (!productionData || productionData.status !== 'running') return;
    
    // Parse the start_time as a local time (using the browser's timezone)
    const startDateStr = productionData.start_time;
    const startTime = new Date(startDateStr).getTime();
    
    const timerInterval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - startTime;
      
      // Format elapsed time as HH:MM:SS
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      
      // Check if the current time has exceeded the shift end time
      // If so, automatically finish the production
      if (shiftEndTime && now >= shiftEndTime && productionData.status === 'running' && !autoCompleted) {
        console.log("Shift ended, automatically finishing production");
        autoFinishProduction(shiftEndTime);
        setAutoCompleted(true);
      }
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [productionData, shiftEndTime, autoCompleted]);

  // Function to automatically finish production when shift ends
  const autoFinishProduction = async (endTime: Date) => {
    if (!productionData) return;
    
    try {
      const response = await fetch(`/api/production-data/${productionData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'finished',
          end_time: endTime.toISOString(), // Use the shift end time, not current time
          qty_achieved: achievedQty, // Use the current achieved quantity
          notes: productionData.notes ? 
            `${productionData.notes} - Automatically finished when shift ended.` : 
            'Automatically finished when shift ended.'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to automatically finish production');
      }
      
      const updatedData = await response.json();
      setProductionData(updatedData.data);
      
      // Show an alert to inform the user
      alert("The shift has ended. Production has been automatically finished.");
      
    } catch (error) {
      console.error("Error auto-finishing production:", error);
      setError(error instanceof Error ? error.message : 'Failed to auto-finish production');
    }
  };

  // Function to manually finish production
  const finishProduction = async () => {
    if (!productionData) return;
    
    try {
      // Confirm the final quantity
      const confirmed = window.confirm(`Finish production with ${achievedQty} units produced?`);
      if (!confirmed) return;
      
      const response = await fetch(`/api/production-data/${productionData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'finished',
          qty_achieved: achievedQty,
          notes: productionData.notes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to finish production');
      }
      
      const updatedData = await response.json();
      setProductionData(updatedData.data);
      
      // Show success message
      alert("Production finished successfully!");
      
      // Redirect to production page after a short delay
      setTimeout(() => {
        router.push('/production');
      }, 1500);
      
    } catch (error) {
      console.error("Error finishing production:", error);
      setError(error instanceof Error ? error.message : 'Failed to finish production');
    }
  };

  // Handle counter increments
  const handleGoodCount = () => {
    setCounters(prev => ({
      ...prev,
      goodCount: prev.goodCount + 1,
      totalCount: prev.totalCount + 1
    }));
    
    // Update achieved quantity
    setAchievedQty(prev => prev + 1);
    
    // Update the database periodically (every 10 items)
    if ((achievedQty + 1) % 10 === 0 && productionData) {
      updateAchievedQuantity(achievedQty + 1);
    }
  };

  const handleBadCount = () => {
    setCounters(prev => ({
      ...prev,
      badCount: prev.badCount + 1,
      totalCount: prev.totalCount + 1
    }));
    
    // For bad counts, we don't increase the achieved quantity
  };
  
  // Update achieved quantity in database
  const updateAchievedQuantity = async (quantity: number) => {
    if (!productionData) return;
    
    try {
      await fetch(`/api/production-data/${productionData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qty_achieved: quantity
        }),
      });
      
      // No need to update UI state as we're already tracking it locally
    } catch (error) {
      console.error("Error updating achieved quantity:", error);
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
          <p>Please log in to access production control.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/production')}
            className="mr-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">
            Production Control
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {productionData?.status === 'running' && (
            <>
              <button 
                onClick={() => router.push(`/production-change/${productionData.id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <FaPlay className="mr-2" /> Change Product
              </button>
              <button 
                onClick={finishProduction}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
              >
                <FaCheck className="mr-2" /> Finish Production
              </button>
            </>
          )}
          
          {productionData?.status === 'paused' && (
            <>
              <button 
                onClick={() => router.push(`/production-change/${productionData.id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <FaPlay className="mr-2" /> Change Product
              </button>
            </>
          )}
          
          {(productionData?.status === 'finished' || productionData?.status === 'stopped') && (
            <button 
              onClick={() => router.push('/production')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Back to Production
            </button>
          )}
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

      {/* Production Info Card */}
      {productionData && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Production Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Department:</p>
                <p className="font-semibold">{productionData.mach_dep}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Machine:</p>
                <p className="font-semibold">{productionData.mach_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Product:</p>
                <p className="font-semibold">{productionData.prod_name} ({productionData.prod_id})</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Shift:</p>
                <p className="font-semibold">{productionData.shift_plan}</p>
                {shiftEndTime && (
                  <p className="text-xs text-gray-500">
                    Ends at: {shiftEndTime.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Goal:</p>
                <p className="font-semibold">
                  {productionData.qty_goal || 'Not set'} units
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Achieved:</p>
                <p className="font-semibold">
                  {achievedQty} units {productionData.qty_goal ? 
                    `(${Math.round((achievedQty / productionData.qty_goal) * 100)}%)` : ''}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Start Time:</p>
                <p className="font-semibold">
                  {new Date(productionData.start_time).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
              
              {productionData.end_time && (
                <div>
                  <p className="text-sm text-gray-600">End Time:</p>
                  <p className="font-semibold">
                    {new Date(productionData.end_time).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">Status:</p>
                <p className="font-semibold">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    productionData.status === 'running' ? 'bg-green-100 text-green-800' :
                    productionData.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {productionData.status.charAt(0).toUpperCase() + productionData.status.slice(1)}
                  </span>
                </p>
              </div>
              
              {productionData.notes && (
                <div className="col-span-3">
                  <p className="text-sm text-gray-600">Notes:</p>
                  <p className="font-semibold">{productionData.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Elapsed Time */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Elapsed Time</h3>
          </div>
          <div className="p-6 flex justify-center items-center">
            <div className="text-4xl font-bold">{elapsedTime}</div>
          </div>
        </div>
        
        {/* Production Counter */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Production Count</h3>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="text-4xl font-bold mb-2">{achievedQty}</div>
            <div className="text-sm text-gray-600">Total Units</div>
            
            {productionData?.qty_goal && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (achievedQty / productionData.qty_goal) * 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quality Metrics */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Quality</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-green-700">Good</span>
              <span className="text-sm font-medium text-green-700">{counters.goodCount}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-red-700">Bad</span>
              <span className="text-sm font-medium text-red-700">{counters.badCount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Yield</span>
              <span className="text-sm font-medium">
                {counters.totalCount > 0 ? Math.round((counters.goodCount / counters.totalCount) * 100) : 0}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${counters.totalCount > 0 ? (counters.goodCount / counters.totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Production Controls */}
      {productionData?.status === 'running' && (
        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={handleGoodCount}
            className="bg-green-600 hover:bg-green-700 text-white p-8 rounded-lg shadow-md text-xl font-semibold transition-colors h-40"
          >
            Good Unit
          </button>
          <button 
            onClick={handleBadCount}
            className="bg-red-600 hover:bg-red-700 text-white p-8 rounded-lg shadow-md text-xl font-semibold transition-colors h-40"
          >
            Bad Unit
          </button>
        </div>
      )}
    </div>
  );
}