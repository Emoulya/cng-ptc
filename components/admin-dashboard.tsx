"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { AdminDataManagement } from "@/components/admin-data-management";
import { AdminAnalytics } from "@/components/admin-analytics";
import { LogOut, Database, BarChart3 } from "lucide-react";

export function AdminDashboard() {
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		window.location.href = "/";
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
					<TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
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
					</TabsList>

					<TabsContent value="data">
						<AdminDataManagement />
					</TabsContent>

					<TabsContent value="analytics">
						<AdminAnalytics />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
