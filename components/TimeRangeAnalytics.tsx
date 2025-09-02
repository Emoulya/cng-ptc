// cng-ptc/components/TimeRangeAnalytics.tsx
"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LineChart as ChartIcon } from "lucide-react";
import { useAnalyticsOverTime } from "@/hooks/use-analytics";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

// Fungsi untuk mendapatkan tanggal awal bulan ini
const getStartOfMonth = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1)
		.toISOString()
		.split("T")[0];
};

// Fungsi untuk mendapatkan tanggal hari ini
const getToday = () => {
	return new Date().toISOString().split("T")[0];
};

export function TimeRangeAnalytics() {
	const [startDate, setStartDate] = useState(getStartOfMonth());
	const [endDate, setEndDate] = useState(getToday());

	const {
		data: chartData,
		isLoading,
		isError,
	} = useAnalyticsOverTime(startDate, endDate);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartIcon className="h-5 w-5" />
					Analitik Berdasarkan Rentang Waktu
				</CardTitle>
				<CardDescription>
					Pilih rentang tanggal untuk melihat tren jumlah pencatatan
					dan rata-rata PSI.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
					<div className="flex-1 space-y-2">
						<label
							htmlFor="start-date"
							className="text-sm font-medium">
							Tanggal Mulai
						</label>
						<Input
							id="start-date"
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
					<div className="flex-1 space-y-2">
						<label
							htmlFor="end-date"
							className="text-sm font-medium">
							Tanggal Selesai
						</label>
						<Input
							id="end-date"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>
				</div>

				<div className="h-[400px] w-full">
					{isLoading ? (
						<div className="flex items-center justify-center h-full">
							<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
						</div>
					) : isError ? (
						<div className="flex items-center justify-center h-full text-red-500">
							Gagal memuat data grafik.
						</div>
					) : !chartData || chartData.length === 0 ? (
						<div className="flex items-center justify-center h-full text-gray-500">
							Tidak ada data untuk rentang tanggal yang dipilih.
						</div>
					) : (
						<ResponsiveContainer
							width="100%"
							height="100%">
							<LineChart
								data={chartData}
								margin={{
									top: 5,
									right: 30,
									left: 20,
									bottom: 5,
								}}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis yAxisId="left" />
								<YAxis
									yAxisId="right"
									orientation="right"
								/>
								<Tooltip />
								<Legend />
								<Line
									yAxisId="left"
									type="monotone"
									dataKey="reading_count"
									name="Jumlah Catatan"
									stroke="#8884d8"
									activeDot={{ r: 8 }}
								/>
								<Line
									yAxisId="right"
									type="monotone"
									dataKey="average_psi"
									name="Rata-rata PSI"
									stroke="#82ca9d"
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
