"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/contexts/data-context";
import type { ReadingWithFlowMeter } from "@/contexts/data-context";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
	totalReadings: number;
	avgPSI: number;
	avgTemp: number;
	avgFlow: number;
	topCustomers: { customer: string; readings: number }[];
}

export function AdminAnalytics() {
	const { getAllReadings } = useData();
	const [readings, setReadings] = useState<ReadingWithFlowMeter[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const data = await getAllReadings();
				setReadings(data);
			} catch (error: any) {
				toast.error("Gagal memuat data analitik", {
					description: error.message,
				});
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [getAllReadings]);

	// Gunakan useMemo untuk menghitung data analitik hanya saat data 'readings' berubah
	const analyticsData = useMemo<AnalyticsData>(() => {
		if (readings.length === 0) {
			return {
				totalReadings: 0,
				avgPSI: 0,
				avgTemp: 0,
				avgFlow: 0,
				topCustomers: [],
			};
		}

		// Hitung rata-rata
		const totalPSI = readings.reduce((sum, r) => sum + Number(r.psi), 0);
		const totalTemp = readings.reduce((sum, r) => sum + Number(r.temp), 0);
		const totalFlow = readings.reduce(
			(sum, r) => sum + Number(r.flow_turbine),
			0
		);

		// Hitung top customers
		const customerCounts = readings.reduce((acc, r) => {
			acc[r.customer_code] = (acc[r.customer_code] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const topCustomers = Object.entries(customerCounts)
			.map(([customer, readings]) => ({ customer, readings }))
			.sort((a, b) => b.readings - a.readings)
			.slice(0, 5);

		return {
			totalReadings: readings.length,
			avgPSI: parseFloat((totalPSI / readings.length).toFixed(1)),
			avgTemp: parseFloat((totalTemp / readings.length).toFixed(1)),
			avgFlow: parseFloat((totalFlow / readings.length).toFixed(1)),
			topCustomers: topCustomers,
		};
	}, [readings]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-10">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
				<p className="ml-3 text-gray-600">
					Menghitung data analitik...
				</p>
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
							{analyticsData.totalReadings}
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
							{analyticsData.avgPSI}
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
							{analyticsData.avgTemp}°C
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
							{analyticsData.avgFlow}
						</div>
						<p className="text-xs text-muted-foreground">
							Rata-rata dari semua data
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Pelanggan Paling Aktif</CardTitle>
					<CardDescription>
						Pelanggan dengan jumlah entri data terbanyak
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
		</div>
	);
}
