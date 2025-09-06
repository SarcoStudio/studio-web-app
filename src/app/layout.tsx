"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { Amplify } from "aws-amplify";
import { AuthProvider } from "@/components/providers/AuthProvider";
import awsconfig from "../aws-exports";
import "@aws-amplify/ui-react/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configure Amplify
console.log("Configuring Amplify with:", awsconfig);
Amplify.configure(awsconfig);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}