import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { DataProvider } from "@/contexts/data-context";

export const metadata: Metadata = {
	title: "PTC Monitoring System",
	description: "Gas Storage Monitoring System",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head></head>
			<body>
				<AuthProvider>
					<DataProvider>{children}</DataProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
