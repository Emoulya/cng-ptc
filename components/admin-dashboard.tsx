"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { AdminDataManagement } from "@/components/admin-data-management";
import { AdminAnalytics } from "@/components/admin-analytics";
import { AdminSettings } from "@/components/admin-settings";
import {
	LogOut,
	Database,
	BarChart3,
	Settings,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminDashboard() {
	const { user, logout } = useAuth();
	const router = useRouter();

	// --- SCROLL BUTTON ---
	const [isAtTop, setIsAtTop] = useState(true);
	const [isAtBottom, setIsAtBottom] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight;
			const winHeight = window.innerHeight;
			const tolerance = 10;

			setIsAtTop(scrollTop < tolerance);
			setIsAtBottom(winHeight + scrollTop >= docHeight - tolerance);
		};

		// Panggil sekali saat mount untuk set state awal
		handleScroll();

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const scrollToBottom = () => {
		window.scrollTo({
			top: document.documentElement.scrollHeight,
			behavior: "smooth",
		});
	};

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Desktop Header */}
			<div className="bg-white border-b border-gray-200 px-6 py-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							PTC Admin Dashboard
						</h1>
						<p className="text-gray-600">
							Gas Storage Monitoring System Administration
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right">
							<p className="text-sm font-medium text-gray-900">
								Administrator
							</p>
							<p className="text-sm text-gray-600">
								{user?.username}
							</p>
						</div>
						<Button
							variant="outline"
							onClick={handleLogout}
							className="flex items-center gap-2 bg-transparent">
							<LogOut className="h-4 w-4" />
							Sign Out
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-6">
				<Tabs
					defaultValue="data"
					className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 lg:w-[490px]">
						<TabsTrigger
							value="data"
							className="flex items-center gap-2">
							<Database className="h-4 w-4" />
							Data Management
						</TabsTrigger>
						<TabsTrigger
							value="analytics"
							className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4" />
							Analytics
						</TabsTrigger>
						<TabsTrigger
							value="settings"
							className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							Settings
						</TabsTrigger>
					</TabsList>

					<TabsContent value="data">
						<AdminDataManagement />
					</TabsContent>

					<TabsContent value="analytics">
						<AdminAnalytics />
					</TabsContent>

					<TabsContent value="settings">
						<AdminSettings />
					</TabsContent>
				</Tabs>
			</div>
			<div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
				{!isAtTop && (
					<Button
						variant="outline"
						size="icon"
						onClick={scrollToTop}
						className="
				bg-white/80 backdrop-blur-sm shadow-lg 
				hover:bg-white hover:shadow-xl hover:scale-110 
				active:scale-95 
				transition-all duration-300 ease-out
				animate-in slide-in-from-bottom-2 fade-in
				hover:-translate-y-1
				group
			">
						<ArrowUp className="h-5 w-5 group-hover:animate-bounce" />
					</Button>
				)}

				{!isAtBottom && (
					<Button
						variant="outline"
						size="icon"
						onClick={scrollToBottom}
						className="
				bg-white/80 backdrop-blur-sm shadow-lg 
				hover:bg-white hover:shadow-xl hover:scale-110 
				active:scale-95 
				transition-all duration-300 ease-out
				animate-in slide-in-from-bottom-2 fade-in
				hover:translate-y-1
				group
			">
						<ArrowDown className="h-5 w-5 group-hover:animate-bounce" />
					</Button>
				)}
			</div>
		</div>
	);
}
