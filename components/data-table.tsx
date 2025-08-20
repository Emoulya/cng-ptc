"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useReadingsByCustomer } from "@/hooks/use-readings";
import { Loader2, Database, Calendar, Clock } from "lucide-react";
import type { ReadingWithFlowMeter } from "@/types/data";

interface DataTableProps {
	customerCode: string;
}

export function DataTable({ customerCode }: DataTableProps) {
	const {
		data: readings = [],
		isLoading,
		isError,
	} = useReadingsByCustomer(customerCode);

	const formatDateTime = (timestamp: string) => {
		const date = new Date(timestamp);

		// Format tanggal seperti biasa
		const formattedDate = date.toLocaleDateString("id-ID", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});

		const formattedTime = date.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			timeZone: "UTC",
		});

		return { date: formattedDate, time: formattedTime };
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
				<div className="flex items-center gap-2">
					<Database className="h-5 w-5 text-blue-600" />
					<span className="font-semibold text-gray-800">
						Data untuk {customerCode}
					</span>
				</div>
				<div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
					{readings.length} entri
				</div>
			</div>

			<div className="relative h-[400px] w-full overflow-auto rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg">
				<Table>
					<TableHeader className="sticky top-0 bg-gradient-to-r from-gray-50 to-blue-50 z-10 border-b-2 border-gray-200">
						<TableRow>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								Jumlah Storage
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								Storage
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									Tanggal
								</div>
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								<div className="flex items-center gap-1">
									<Clock className="h-4 w-4" />
									Waktu
								</div>
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								PSI
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								Temp
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								PSI Out
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								Flow/Turbin
							</TableHead>
							<TableHead className="font-semibold text-gray-700 border-r border-gray-200">
								Flow Meter
							</TableHead>
							<TableHead className="font-semibold text-gray-700 min-w-[120px]">
								Keterangan
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={10}
									className="text-center py-12">
									<Loader2 className="h-8 w-8 animate-spin mx-auto" />
								</TableCell>
							</TableRow>
						) : isError ? (
							<TableRow>
								<TableCell
									colSpan={10}
									className="text-center text-red-600 py-12">
									Gagal memuat data.
								</TableCell>
							</TableRow>
						) : readings.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={10}
									className="text-center text-gray-500 py-12">
									<div className="flex flex-col items-center gap-2">
										<Database className="h-8 w-8 text-gray-300" />
										<p className="text-base font-medium">
											Tidak ada entri data untuk{" "}
											{customerCode}
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							readings.map(
								(row: ReadingWithFlowMeter, index: number) => {
									const { date, time } = formatDateTime(
										row.created_at
									);
									return (
										<TableRow
											key={row.id}
											className={`hover:bg-blue-50/50 transition-colors duration-200 ${
												index % 2 === 0
													? "bg-white/50"
													: "bg-gray-50/30"
											}`}>
											<TableCell className="border-r border-gray-100 font-semibold text-green-700">
												{row.fixed_storage_quantity}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-medium">
												{row.storage_number}
											</TableCell>
											<TableCell className="font-mono text-sm font-medium border-r border-gray-100 bg-blue-50/30">
												{date}
											</TableCell>
											<TableCell className="font-mono text-sm font-medium border-r border-gray-100 bg-purple-50/30">
												{time}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-red-600">
												{String(row.psi)}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-orange-600">
												{String(row.temp)}°C
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-indigo-600">
												{String(row.psi_out)}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-cyan-600">
												{String(row.flow_turbine)}
											</TableCell>
											<TableCell className="font-mono border-r border-gray-100 bg-gray-50/50">
												{row.flowMeter}
											</TableCell>
											<TableCell className="text-sm max-w-[150px]">
												<div
													className={`${
														row.remarks
															? "bg-yellow-50 border border-yellow-200 rounded px-2 py-1"
															: ""
													}`}>
													{row.remarks || (
														<span className="text-gray-400 italic">
															Tidak ada keterangan
														</span>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								}
							)
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
