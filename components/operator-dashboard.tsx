"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { CustomerSelector } from "@/components/customer-selector";
import { DataTable } from "@/components/data-table";
import { DataEntryForm } from "@/components/data-entry-form";
import {
	LogOut,
	Plus,
	BarChart3,
	Activity,
	Database,
	Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function OperatorDashboard() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [selectedCustomer, setSelectedCustomer] = useState<string>("");
	const [showDataEntry, setShowDataEntry] = useState(false);
	const [showDataTable, setShowDataTable] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		setShowDataEntry(false);
		setShowDataTable(false);
	}, [selectedCustomer]);

	useEffect(() => {
		// Update waktu setiap detik
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	const handleDataEntrySuccess = () => {
		setShowDataEntry(false);
		setShowDataTable(true);
	};

	const formattedDate = currentTime.toLocaleDateString("id-ID", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "long",
		day: "numeric",
		weekday: "long",
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sticky top-0 z-10 shadow-lg backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
							<Activity className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-xl font-bold tracking-tight">
								PTC Monitoring
							</h1>
							<p className="text-blue-100 text-sm font-medium">
								Operator: {user?.username}
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLogout}
						className="text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm">
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="p-4 space-y-6">
				{/* Customer Selection */}
				<Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
					<CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
						<CardTitle className="text-lg flex items-center gap-2 text-gray-800">
							<Database className="h-5 w-5 text-blue-600" />
							Pilih Customer
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<CustomerSelector
							value={selectedCustomer}
							onChange={setSelectedCustomer}
						/>
					</CardContent>
				</Card>

				{selectedCustomer && (
					<>
						{/* Card Tanggal */}
						<Card className="shadow-lg border-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white overflow-hidden relative">
							<div className="absolute inset-0 bg-black/10"></div>
							<CardContent className="pt-6 relative z-10">
								<div className="text-center">
									<div className="flex items-center justify-center gap-2 mb-2">
										<Calendar className="h-5 w-5" />
										<p className="text-orange-100 font-medium">
											Tanggal Pencatatan
										</p>
									</div>
									<p className="text-2xl font-bold mb-3">
										{formattedDate}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="grid grid-cols-2 gap-4">
							<Button
								onClick={() => {
									setShowDataEntry(true);
									setShowDataTable(false);
								}}
								className="h-16 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
								<Plus className="h-5 w-5" />
								<span className="font-medium">Input Data</span>
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setShowDataTable(true);
									setShowDataEntry(false);
								}}
								className="h-16 flex flex-col items-center justify-center gap-2 border-2 border-blue-200 bg-white/70 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
								<BarChart3 className="h-5 w-5 text-blue-600" />
								<span className="font-medium text-blue-700">
									Lihat Data
								</span>
							</Button>
						</div>

						{/* Conditional Content */}
						{showDataEntry && (
							<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
								<CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
									<CardTitle className="text-lg flex items-center gap-2 text-gray-800">
										<Plus className="h-5 w-5 text-green-600" />
										Input Data - {selectedCustomer}
									</CardTitle>
								</CardHeader>
								<CardContent className="p-6">
									<DataEntryForm
										customerCode={selectedCustomer}
										onSuccess={handleDataEntrySuccess}
									/>
								</CardContent>
							</Card>
						)}

						{showDataTable && (
							<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
								<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
									<CardTitle className="text-lg flex items-center gap-2 text-gray-800">
										<BarChart3 className="h-5 w-5 text-blue-600" />
										Riwayat Data - {selectedCustomer}
									</CardTitle>
								</CardHeader>
								<CardContent className="p-6">
									<DataTable
										customerCode={selectedCustomer}
									/>
								</CardContent>
							</Card>
						)}
					</>
				)}
			</div>
		</div>
	);
}
