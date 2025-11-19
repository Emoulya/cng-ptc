// cng-ptc/components/admin-analytics.tsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { TimeRangeAnalytics } from "./TimeRangeAnalytics";
import { formatNumber } from "@/lib/utils";

export function AdminAnalytics() {
	// Panggil hook untuk mengambil data yang sudah diproses dari backend
	const { data: analyticsData, isLoading } = useAnalytics();

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-10">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
				<p className="ml-3 text-gray-600">
					Memuat data analitik dari server...
				</p>
			</div>
		);
	}

	// Jika tidak ada data atau terjadi error
	if (!analyticsData) {
		return (
			<div className="text-center text-gray-500 py-10">
				Tidak ada data untuk dianalisis.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Readings
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(analyticsData.totalReadings)}
						</div>
						<p className="text-xs text-muted-foreground">
							Sepanjang waktu
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Rata-rata PSI
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(analyticsData.avgPSI)}
						</div>
						<p className="text-xs text-muted-foreground">
							Rata-rata dari semua data
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Rata-rata Temp
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(analyticsData.avgTemp)}°C
						</div>
						<p className="text-xs text-muted-foreground">
							Rata-rata dari semua data
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Rata-rata Flow
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(analyticsData.avgFlow)}
						</div>
						<p className="text-xs text-muted-foreground">
							Rata-rata dari semua data
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Customer Paling Aktif</CardTitle>
					<CardDescription>
						Customer dengan jumlah entri data terbanyak
					</CardDescription>
				</CardHeader>
				<CardContent>
					{analyticsData.topCustomers.length > 0 ? (
						<div className="space-y-4">
							{analyticsData.topCustomers.map(
								(customer, index) => (
									<div
										key={customer.customer}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
												{index + 1}
											</div>
											<div>
												<Badge
													variant="outline"
													className="mb-1">
													{customer.customer}
												</Badge>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium">
												{customer.readings}
											</p>
											<p className="text-xs text-gray-500">
												entri data
											</p>
										</div>
									</div>
								)
							)}
						</div>
					) : (
						<p className="text-center text-gray-500 py-4">
							Belum ada data untuk dianalisis.
						</p>
					)}
				</CardContent>
			</Card>
			<TimeRangeAnalytics />
		</div>
	);
}
