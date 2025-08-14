import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/hooks/use-auth";
import { DataProvider } from "@/contexts/data-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "PTC Monitoring System",
	description: "Gas Storage Monitoring System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
			</head>
			<body>
				<AuthProvider>
					<DataProvider>
						{children}
						<Toaster />
					</DataProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
