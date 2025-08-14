"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

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
		</div>
	);
}
