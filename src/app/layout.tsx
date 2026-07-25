import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "@/app/globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { ToastContextProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LeadDesk Mini",
    template: "%s · LeadDesk Mini",
  },
  description: "Capture, track, and convert leads with LeadDesk Mini.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-sans`}>
        <QueryProvider>
          <ToastContextProvider>
            {children}
            <Toaster />
          </ToastContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
