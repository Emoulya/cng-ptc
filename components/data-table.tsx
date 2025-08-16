"use client";

import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useData } from "@/contexts/data-context";
import type { ReadingWithFlowMeter } from "@/contexts/data-context";
import { Loader2 } from "lucide-react";

interface DataTableProps {
	customerCode: string;
}

export function DataTable({ customerCode }: DataTableProps) {
	const { getReadingsByCustomer } = useData();
	const [readings, setReadings] = useState<ReadingWithFlowMeter[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const data = await getReadingsByCustomer(customerCode);
				setReadings(data);
			} catch (error) {
				console.error("Failed to fetch data:", error);
				// Anda bisa menambahkan notifikasi toast di sini jika mau
			} finally {
				setIsLoading(false);
			}
		};

		if (customerCode) {
			fetchData();
		}
	}, [customerCode, getReadingsByCustomer]);

	const formatDateTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const formattedDate = date.toLocaleDateString("id-ID", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		const formattedTime = date.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
		return { date: formattedDate, time: formattedTime };
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-gray-600">
				Showing {readings.length} recent entries for {customerCode}
			</p>
			<div className="relative h-[400px] w-full overflow-auto rounded-md border">
				<Table>
					<TableHeader className="sticky top-0 bg-gray-50 z-10">
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Time</TableHead>
							<TableHead>Jumlah Fix Storage</TableHead>
							<TableHead>Storage</TableHead>
							<TableHead>PSI</TableHead>
							<TableHead>Temp</TableHead>
							<TableHead>PSI Out</TableHead>
							<TableHead>Flow/Turbin</TableHead>
							<TableHead>Flow Meter</TableHead>
							<TableHead className="min-w-[120px]">
								Remarks
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={10}
									className="text-center py-8">
									<Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
									<p className="mt-2 text-sm text-gray-500">
										Loading data...
									</p>
								</TableCell>
							</TableRow>
						) : readings.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={10}
									className="text-center text-gray-500 py-8">
									No data entries found for {customerCode}
								</TableCell>
							</TableRow>
						) : (
							readings.map((row) => {
								const { date, time } = formatDateTime(
									row.created_at
								);
								return (
									<TableRow key={row.id}>
										<TableCell className="font-mono text-xs">
											{date}
										</TableCell>
										<TableCell className="font-mono text-xs">
											{time}
										</TableCell>
										<TableCell>
											{row.fixed_storage_quantity}
										</TableCell>
										<TableCell>
											{row.storage_number}
										</TableCell>
										<TableCell>{String(row.psi)}</TableCell>
										<TableCell>
											{String(row.temp)}°C
										</TableCell>
										<TableCell>
											{String(row.psi_out)}
										</TableCell>
										<TableCell>
											{String(row.flow_turbine)}
										</TableCell>
										<TableCell className="font-mono">
											{row.flowMeter}
										</TableCell>
										<TableCell className="text-xs">
											{row.remarks || "-"}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
