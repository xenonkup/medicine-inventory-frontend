import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PharmaCare — Pharmacy Inventory Management",
  description:
    "Enterprise pharmacy inventory management system for hospitals and pharmacies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${roboto.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider delay={200}>
                {children}
                <Toaster
                  richColors
                  position="top-right"
                  toastOptions={{
                    className: "font-sans",
                  }}
                />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
