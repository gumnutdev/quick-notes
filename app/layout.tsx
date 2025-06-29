import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Providers } from "./providers";
import React from "react";
import { GumnutProvider } from "@/components/GumnutProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NotesVault - Your Personal Mind Garden",
  description: "A beautiful note-taking app with mind mapping capabilities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <GumnutProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </GumnutProvider>
        </Providers>
      </body>
    </html>
  );
}
