"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useData } from "@/contexts/data-context";

interface DataTableProps {
	customerCode: string;
}

export function DataTable({ customerCode }: DataTableProps) {
	const { getReadingsByCustomer } = useData();
	const customerReadings = getReadingsByCustomer(customerCode);

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
				Showing {customerReadings.length} recent entries for{" "}
				{customerCode}
			</p>
			{/* --- PERUBAHAN DI SINI --- */}
			<div className="relative h-[400px] w-full overflow-auto rounded-md border">
				<Table>
					<TableHeader className="sticky top-0 bg-gray-50">
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
						{customerReadings.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={10}
									className="text-center text-gray-500 py-8">
									No data entries found for {customerCode}
								</TableCell>
							</TableRow>
						) : (
							customerReadings.map((row) => {
								const { date, time } = formatDateTime(
									row.timestamp
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
											{row.fixedStorageQuantity}
										</TableCell>
										<TableCell>{row.storage}</TableCell>
										<TableCell>{row.psi}</TableCell>
										<TableCell>{row.temp}°C</TableCell>
										<TableCell>{row.psiOut}</TableCell>
										<TableCell>{row.flowTurbine}</TableCell>
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
