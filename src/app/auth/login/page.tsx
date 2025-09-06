"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import '@aws-amplify/ui-react/styles.css'; // Import Amplify UI styles

export default function Login() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showDashboardButton, setShowDashboardButton] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        if (session) {
          console.log("User authenticated, redirecting...");
          router.replace("/");
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.log("User not authenticated:", error);
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  return (
    <div 
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center relative" 
      style={{ backgroundImage: "url('/2880x1800 Desktop - Dark.png')" }} 
    >
      <h1 className="text-2xl font-bold mb-4 text-white">Login</h1>
      <div className="relative z-10">
        <Authenticator 
          components={{
            SignIn: {
              Footer() {
                return (
                  <div className="text-center mt-4">
                    <button 
                      onClick={() => {
                        console.log("Authentication successful");
                        setShowDashboardButton(true);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Proceed to Dashboard
                    </button>
                  </div>
                );
              }
            }
          }}
        />
      </div>
      {showDashboardButton && (
        <button
          onClick={() => router.replace("/")}
          className="absolute bottom-10 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 z-0"
        >
          Go to Dashboard
        </button>
      )}
    </div>
  );
}