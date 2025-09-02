// components\data-table.tsx
"use client";

import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useProcessedReadingsByCustomer } from "@/hooks/use-readings";
import { Loader2, Database, Pencil } from "lucide-react";
import type {
	ReadingWithFlowMeter,
	TableRowData,
	DumpingTotalRow,
} from "@/types/data";
import { EditReadingForm } from "./edit-reading-form";

interface DataTableProps {
	customerCode: string;
}

export function DataTable({ customerCode }: DataTableProps) {
	const {
		data: processedReadings = [],
		isLoading,
		isError,
	} = useProcessedReadingsByCustomer(customerCode);

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedReading, setSelectedReading] =
		useState<ReadingWithFlowMeter | null>(null);

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
		});
		return { date: formattedDate, time: formattedTime };
	};

	const handleEditClick = (reading: ReadingWithFlowMeter) => {
		setSelectedReading(reading);
		setIsEditDialogOpen(true);
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
					{processedReadings.length} entri
				</div>
			</div>

			<div className="relative h-[400px] w-full overflow-auto rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg">
				<Table>
					<TableHeader className="sticky top-0 bg-gradient-to-r from-gray-50 to-blue-50 z-10 border-b-2 border-gray-200">
						<TableRow>
							<TableHead>Jml Storage</TableHead>
							<TableHead>Storage</TableHead>
							<TableHead>Tanggal</TableHead>
							<TableHead>Waktu</TableHead>
							<TableHead>PSI</TableHead>
							<TableHead>Temp</TableHead>
							<TableHead>PSI Out</TableHead>
							<TableHead>Flow/Turbin</TableHead>
							<TableHead>Flow Meter</TableHead>
							<TableHead>Keterangan</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={11}
									className="text-center py-12">
									<Loader2 className="h-8 w-8 animate-spin mx-auto" />
								</TableCell>
							</TableRow>
						) : isError ? (
							<TableRow>
								<TableCell
									colSpan={11}
									className="text-center text-red-600 py-12">
									Gagal memuat data.
								</TableCell>
							</TableRow>
						) : processedReadings.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={11}
									className="text-center text-gray-500 py-12">
									Tidak ada entri data.
								</TableCell>
							</TableRow>
						) : (
							processedReadings.map((row) => {
								if ("isChangeRow" in row && row.isChangeRow) {
									return (
										<TableRow
											key={row.id}
											className="bg-yellow-100 hover:bg-yellow-200 font-bold text-yellow-900">
											<TableCell>CHANGE</TableCell>
											<TableCell></TableCell>
											<TableCell>
												{
													formatDateTime(
														row.recorded_at
													).date
												}
											</TableCell>
											<TableCell>
												{row.duration}
											</TableCell>
											<TableCell colSpan={4}></TableCell>
											<TableCell>
												{Math.round(row.totalFlow)}
											</TableCell>
											<TableCell colSpan={2}></TableCell>
										</TableRow>
									);
								}
								if ("isDumpingTotalRow" in row) {
									const summary = row as DumpingTotalRow;
									return (
										<TableRow
											key={summary.id}
											className="bg-blue-200 hover:bg-blue-300 font-bold text-blue-900">
											<TableCell>TOTAL</TableCell>
											<TableCell>
												{summary.storage_number}
											</TableCell>
											<TableCell>
												{
													formatDateTime(
														summary.recorded_at
													).date
												}
											</TableCell>
											<TableCell>
												{summary.duration}
											</TableCell>
											<TableCell colSpan={4}></TableCell>
											<TableCell>
												{Math.round(summary.totalFlow)}
											</TableCell>
											<TableCell colSpan={2}></TableCell>
										</TableRow>
									);
								}
								if (
									"isDumpingSummary" in row &&
									row.isDumpingSummary
								) {
									return (
										<TableRow
											key={row.id}
											className="bg-blue-200 hover:bg-blue-300 font-bold text-blue-900">
											<TableCell>1</TableCell>
											<TableCell colSpan={2}></TableCell>
											<TableCell>
												{row.duration}
											</TableCell>
											<TableCell colSpan={7}></TableCell>
										</TableRow>
									);
								}

								const reading = row as ReadingWithFlowMeter;
								const { date, time } = formatDateTime(
									reading.recorded_at
								);
								return (
									<TableRow key={reading.id}>
										<TableCell>
											{reading.fixed_storage_quantity}
										</TableCell>
										<TableCell>
											{reading.storage_number}
										</TableCell>
										<TableCell>{date}</TableCell>
										<TableCell>{time}</TableCell>
										<TableCell>
											{String(reading.psi)}
										</TableCell>
										<TableCell>
											{String(reading.temp)}°C
										</TableCell>
										<TableCell>
											{String(reading.psi_out)}
										</TableCell>
										<TableCell>
											{String(reading.flow_turbine)}
										</TableCell>
										<TableCell>
											{reading.flowMeter}
										</TableCell>
										<TableCell className="text-sm max-w-[150px]">
											{reading.remarks || "-"}
										</TableCell>
										<TableCell>
											{reading.is_editable && (
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleEditClick(reading)
													}>
													<Pencil className="h-4 w-4" />
												</Button>
											)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Data Reading</DialogTitle>
					</DialogHeader>
					{selectedReading && (
						<EditReadingForm
							reading={selectedReading}
							onSuccess={() => {
								setIsEditDialogOpen(false);
								setSelectedReading(null);
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
