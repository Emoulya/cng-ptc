"use client";

import { useMemo } from "react";
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
import type {
	ReadingWithFlowMeter,
	TableRowData,
	ChangeSummaryRow,
} from "@/types/data";

interface DataTableProps {
	customerCode: string;
}

export function DataTable({ customerCode }: DataTableProps) {
	const {
		data: readings = [],
		isLoading,
		isError,
	} = useReadingsByCustomer(customerCode);

	const processedReadings = useMemo(() => {
		if (!readings || readings.length === 0) return [];

		const result: TableRowData[] = [];
		let currentStorageBlock: ReadingWithFlowMeter[] = [];

		for (let i = 0; i < readings.length; i++) {
			const currentReading = readings[i];
			const nextReading = readings[i + 1];

			currentStorageBlock.push(currentReading);

			// Cek jika ini adalah bacaan terakhir ATAU storage berikutnya berbeda
			if (
				!nextReading ||
				nextReading.storage_number !== currentReading.storage_number
			) {
				// Tambahkan semua data dari blok saat ini ke hasil
				result.push(...currentStorageBlock);

				// HANYA tambahkan baris CHANGE jika ADA PERUBAHAN storage
				// dan blok saat ini memiliki lebih dari satu entri
				if (
					nextReading && // Pastikan ada data berikutnya
					nextReading.storage_number !==
						currentReading.storage_number &&
					currentStorageBlock.length > 1
				) {
					const totalFlow = currentStorageBlock.reduce((sum, r) => {
						const flow = Number(r.flowMeter);
						return sum + (isNaN(flow) ? 0 : flow);
					}, 0);

					const startTime = new Date(
						currentStorageBlock[0].created_at
					);
					const endTime = new Date(
						currentStorageBlock[
							currentStorageBlock.length - 1
						].created_at
					);
					const diffMs = endTime.getTime() - startTime.getTime();
					const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
					const diffMins = Math.floor(
						(diffMs % (1000 * 60 * 60)) / (1000 * 60)
					);
					const duration = `${diffHours} jam ${diffMins} menit`;

					const changeRow: ChangeSummaryRow = {
						id: `change-${currentReading.id}`,
						isChangeRow: true,
						totalFlow: totalFlow,
						duration: duration,
						customer_code: currentReading.customer_code,
						created_at: currentReading.created_at,
					};
					result.push(changeRow);
				}

				currentStorageBlock = [];
			}
		}

		return result;
	}, [readings]);

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
						) : processedReadings.length === 0 ? (
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
							processedReadings.map((row, index) => {
								if ("isChangeRow" in row && row.isChangeRow) {
									return (
										<TableRow
											key={row.id}
											className="bg-yellow-100 hover:bg-yellow-200 font-bold">
											<TableCell>CHANGE</TableCell>
											<TableCell colSpan={2}>
												Durasi: {row.duration}
											</TableCell>
											<TableCell colSpan={5}></TableCell>
											<TableCell>
												{row.totalFlow}
											</TableCell>
											<TableCell></TableCell>
										</TableRow>
									);
								} else {
									const reading = row as ReadingWithFlowMeter;
									const { date, time } = formatDateTime(
										reading.created_at
									);
									return (
										<TableRow
											key={reading.id}
											className={`hover:bg-blue-50/50 transition-colors duration-200 ${
												index % 2 === 0
													? "bg-white/50"
													: "bg-gray-50/30"
											}`}>
											<TableCell className="border-r border-gray-100 font-semibold text-green-700">
												{reading.fixed_storage_quantity}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-medium">
												{reading.storage_number}
											</TableCell>
											<TableCell className="font-mono text-sm font-medium border-r border-gray-100 bg-blue-50/30">
												{date}
											</TableCell>
											<TableCell className="font-mono text-sm font-medium border-r border-gray-100 bg-purple-50/30">
												{time}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-red-600">
												{String(reading.psi)}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-orange-600">
												{String(reading.temp)}°C
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-indigo-600">
												{String(reading.psi_out)}
											</TableCell>
											<TableCell className="border-r border-gray-100 font-mono font-semibold text-cyan-600">
												{String(reading.flow_turbine)}
											</TableCell>
											<TableCell className="font-mono border-r border-gray-100 bg-gray-50/50">
												{reading.flowMeter}
											</TableCell>
											<TableCell className="text-sm max-w-[150px]">
												<div
													className={`${
														reading.remarks
															? "bg-yellow-50 border border-yellow-200 rounded px-2 py-1"
															: ""
													}`}>
													{reading.remarks || (
														<span className="text-gray-400 italic">
															Tidak ada keterangan
														</span>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								}
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
