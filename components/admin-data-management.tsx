// cng-ptc/components/admin-data-management.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkOperations } from "@/components/bulk-operations";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	Search,
	Download,
	Loader2,
	Users,
	Activity,
	Database,
	AlertTriangle,
	ArrowUpDown,
	MoreHorizontal,
	Edit,
	Trash2,
	Clock,
	Calendar,
} from "lucide-react";
import { useAllReadings, useDeleteReading } from "@/hooks/use-readings";
import { useCustomers } from "@/hooks/use-customers";
import * as XLSX from "xlsx-js-style";
import type {
	ReadingWithFlowMeter,
	TableRowData,
	DumpingTotalRow,
	StopSummaryRow,
} from "@/types/data";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditReadingForm } from "./edit-reading-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);
	return debouncedValue;
}

export function AdminDataManagement() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState("all");
	const [selectedOperator, setSelectedOperator] = useState("all");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [timeRange, setTimeRange] = useState<
		"day" | "week" | "month" | "all"
	>("week");

	const [isExporting, setIsExporting] = useState(false);
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [selectedCustomersForExport, setSelectedCustomersForExport] = useState<string[]>([]);

	const filters = useMemo(
		() => ({
			customer: selectedCustomer,
			operator: selectedOperator,
			searchTerm: debouncedSearchTerm,
			sortOrder: sortOrder,
			timeRange: timeRange,
		}),
		[
			selectedCustomer,
			selectedOperator,
			debouncedSearchTerm,
			sortOrder,
			timeRange,
		]
	);

	const { data: readings = [], isLoading } = useAllReadings(filters);
	const { data: customers = [] } = useCustomers();
	const { data: allReadingsForStats = [] } = useAllReadings({
		customer: "all",
		operator: "all",
		searchTerm: "",
		sortOrder: "asc",
		timeRange: "all",
	});

	const { mutate: deleteReading } = useDeleteReading();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedReading, setSelectedReading] =
		useState<ReadingWithFlowMeter | null>(null);

	const { uniqueCustomers, uniqueOperators, todayReadings } = useMemo(() => {
		const customersSet = new Set(
			allReadingsForStats.map((r) => r.customer_code)
		);
		const operatorsSet = new Set(
			allReadingsForStats.map((r) => r.profiles?.username || "Unknown")
		);
		const today = new Date().toDateString();
		const readingsToday = allReadingsForStats.filter(
			(r) => new Date(r.recorded_at).toDateString() === today
		).length;
		return {
			uniqueCustomers: Array.from(customersSet),
			uniqueOperators: Array.from(operatorsSet),
			todayReadings: readingsToday,
		};
	}, [allReadingsForStats]);
    
    const uniqueCustomersInView = useMemo(() => {
        return Array.from(new Set(readings.map((r) => r.customer_code)));
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
		});
		return { date: formattedDate, time: formattedTime };
	};

	const handleEditClick = (reading: ReadingWithFlowMeter) => {
		setSelectedReading(reading);
		setIsEditDialogOpen(true);
	};

	const formatTimestampForHover = (timestamp: string) => {
		return new Date(timestamp).toLocaleString("id-ID", {
			timeZone: "Asia/Jakarta",
			dateStyle: "full",
			timeStyle: "long",
		});
	};

	const processedReadings = useMemo(() => {
		if (!readings || readings.length === 0) return [];

		const readingsWithFlowMeter = readings.map((current, index, arr) => {
			let flowMeter: number | string = "-";
			const previous = arr[index - 1];

			if (
				previous &&
				current.storage_number === previous.storage_number &&
				(current.operation_type === previous.operation_type ||
					(current.operation_type === "stop" &&
						previous.operation_type === "manual"))
			) {
				const diff =
					Number(current.flow_turbine) -
					Number(previous.flow_turbine);
				flowMeter = isNaN(diff) || diff < 0 ? "-" : diff;
			}

			return { ...current, flowMeter };
		});

		const result: TableRowData[] = [];
		let i = 0;
		while (i < readingsWithFlowMeter.length) {
			const startReading = readingsWithFlowMeter[i];

			if (
				startReading.operation_type === "manual" ||
				startReading.operation_type === "stop"
			) {
				let endIndex = i;
				while (
					endIndex + 1 < readingsWithFlowMeter.length &&
					readingsWithFlowMeter[endIndex + 1].storage_number ===
						startReading.storage_number &&
					(readingsWithFlowMeter[endIndex + 1].operation_type ===
						"manual" ||
						readingsWithFlowMeter[endIndex + 1].operation_type ===
							"stop")
				) {
					endIndex++;
					if (
						readingsWithFlowMeter[endIndex].operation_type ===
						"stop"
					)
						break;
				}

				const manualBlock = readingsWithFlowMeter.slice(
					i,
					endIndex + 1
				);
				result.push(...manualBlock);

				const lastReadingInBlock = manualBlock[manualBlock.length - 1];
				const nextReading = readingsWithFlowMeter[endIndex + 1];
				const totalFlow = manualBlock.reduce(
					(sum, r) => sum + (Number(r.flowMeter) || 0),
					0
				);
				const startTime = new Date(manualBlock[0].recorded_at);
				const endTime = new Date(lastReadingInBlock.recorded_at);
				const diffMs = endTime.getTime() - startTime.getTime();
				const diffMinutes = Math.floor(diffMs / 60000);
				const pad = (num: number) => String(num).padStart(2, "0");
				const durationStr = `${pad(Math.floor(diffMinutes / 60))}:${pad(
					diffMinutes % 60
				)}`;

				if (lastReadingInBlock.operation_type === "stop") {
					result.push({
						id: `stop-summary-${lastReadingInBlock.id}`,
						isStopRow: true,
						totalFlow,
						duration: durationStr,
						customer_code: lastReadingInBlock.customer_code,
						recorded_at: lastReadingInBlock.recorded_at,
					});
				} else if (nextReading) {
					if (nextReading.operation_type === "dumping") {
						const endTimeStr = endTime.toLocaleTimeString("id-ID", {
							hour: "2-digit",
							minute: "2-digit",
						});
						result.push({
							id: `total-before-dump-${lastReadingInBlock.id}`,
							isDumpingTotalRow: true,
							totalFlow,
							duration: endTimeStr,
							customer_code: lastReadingInBlock.customer_code,
							recorded_at: lastReadingInBlock.recorded_at,
							storage_number: lastReadingInBlock.storage_number,
						});
					} else if (
						nextReading.customer_code ===
							lastReadingInBlock.customer_code &&
						nextReading.storage_number !==
							lastReadingInBlock.storage_number
					) {
						result.push({
							id: `change-${lastReadingInBlock.id}`,
							isChangeRow: true,
							totalFlow,
							duration: durationStr,
							customer_code: lastReadingInBlock.customer_code,
							recorded_at: lastReadingInBlock.recorded_at,
						});
					}
				}
				i = endIndex + 1;
			} else if (startReading.operation_type === "dumping") {
				let endIndex = i;
				while (
					endIndex + 1 < readingsWithFlowMeter.length &&
					readingsWithFlowMeter[endIndex + 1].operation_type ===
						"dumping"
				) {
					endIndex++;
				}

				const dumpingSourceBlock = readingsWithFlowMeter.slice(
					i,
					endIndex + 1
				);
				result.push(...dumpingSourceBlock);

				const overallStartTime = new Date(
					dumpingSourceBlock[0].recorded_at
				);
				const overallEndTime = new Date(
					dumpingSourceBlock[
						dumpingSourceBlock.length - 1
					].recorded_at
				);
				const diffMs =
					overallEndTime.getTime() - overallStartTime.getTime();
				const diffMinutes = Math.floor(diffMs / 60000);
				const pad = (num: number) => String(num).padStart(2, "0");
				const duration = `${pad(Math.floor(diffMinutes / 60))}:${pad(
					diffMinutes % 60
				)}`;

				result.push({
					id: `dumping-summary-${startReading.id}`,
					isDumpingSummary: true,
					totalFlow: 0,
					duration,
					customer_code: startReading.customer_code,
					recorded_at: overallEndTime.toISOString(),
				});

				i = endIndex + 1;
			} else {
				result.push(startReading);
				i++;
			}
		}
		return result;
	}, [readings]);

	const handleDelete = (id: number) => {
		deleteReading(id);
	};
    
    // --- FUNGSI EKSPOR DIPERBARUI ---
	const handleExport = async () => {
		if (selectedCustomersForExport.length === 0) {
			toast.warning("Tidak ada pelanggan yang dipilih untuk diekspor.");
			return;
		}
		setIsExporting(true);
		try {
			const response = await fetch("/template-laporan.xlsm");
			if (!response.ok) throw new Error("Gagal memuat file template.");
			const arrayBuffer = await response.arrayBuffer();
			const workbook = XLSX.read(arrayBuffer, { type: "buffer" });

			const customersToExport = selectedCustomersForExport;
			const templateSheetName = "sheet1";

			customersToExport.forEach((customerCode) => {
				const templateWorksheet = workbook.Sheets[templateSheetName];
				if (!templateWorksheet)
					throw new Error("Sheet 'sheet1' tidak ditemukan.");

				const newSheet = JSON.parse(JSON.stringify(templateWorksheet));

				const customerInfo = customers.find(
					(c) => c.code === customerCode
				);
				const customerName = customerInfo?.name || customerCode;
				newSheet["I5"] = { t: "s", v: `PT. ${customerName}` };
				newSheet["E3"] = { t: "s", v: `PT. ${customerName}` };

				// --- LOGIKA PEMROSESAN DATA UNTUK EKSPOR ---
				const customerRawData = readings
					.filter((row) => row.customer_code === customerCode)
					.map((current, index, arr) => {
						let flowMeter: number | string = "-";
						const previous = arr[index - 1];
						if (
							previous &&
							current.storage_number ===
								previous.storage_number &&
							(current.operation_type ===
								previous.operation_type ||
								(current.operation_type === "stop" &&
									previous.operation_type === "manual"))
						) {
							const diff =
								Number(current.flow_turbine) -
								Number(previous.flow_turbine);
							flowMeter = isNaN(diff) || diff < 0 ? "-" : diff;
						}
						return { ...current, flowMeter };
					});
				const customerProcessedData = [];
				let i = 0;
				while (i < customerRawData.length) {
					const startReading = customerRawData[i];
					if (
						startReading.operation_type === "manual" ||
						startReading.operation_type === "stop"
					) {
						let endIndex = i;
						while (
							endIndex + 1 < customerRawData.length &&
							customerRawData[endIndex + 1].storage_number ===
								startReading.storage_number &&
							(customerRawData[endIndex + 1].operation_type ===
								"manual" ||
								customerRawData[endIndex + 1].operation_type ===
									"stop")
						) {
							endIndex++;
							if (
								customerRawData[endIndex].operation_type ===
								"stop"
							)
								break;
						}
						const manualBlock = customerRawData.slice(
							i,
							endIndex + 1
						);
						customerProcessedData.push(...manualBlock);
						const lastReadingInBlock =
							manualBlock[manualBlock.length - 1];
						const nextReading = customerRawData[endIndex + 1];

						if (nextReading) {
							const totalFlow = manualBlock.reduce(
								(sum, r: { flowMeter: number | string }) =>
									sum + (Number(r.flowMeter) || 0),
								0
							);
							const startTime = new Date(
								manualBlock[0].recorded_at
							);
							const endTime = new Date(
								lastReadingInBlock.recorded_at
							);

							if (nextReading.operation_type === "dumping") {
								const endTimeStr = endTime.toLocaleTimeString(
									"id-ID",
									{
										hour: "2-digit",
										minute: "2-digit",
									}
								);
								customerProcessedData.push({
									id: `total-before-dump-${lastReadingInBlock.id}`,
									isDumpingTotalRow: true,
									totalFlow,
									duration: endTimeStr,
									customer_code:
										lastReadingInBlock.customer_code,
									recorded_at: lastReadingInBlock.recorded_at,
									storage_number:
										lastReadingInBlock.storage_number,
								});
							} else if (
								nextReading.customer_code ===
									lastReadingInBlock.customer_code &&
								nextReading.storage_number !==
									lastReadingInBlock.storage_number
							) {
								const diffMs =
									endTime.getTime() - startTime.getTime();
								const diffMinutes = Math.floor(diffMs / 60000);
								const pad = (num: number) =>
									String(num).padStart(2, "0");
								const durationStr = `${pad(
									Math.floor(diffMinutes / 60)
								)}:${pad(diffMinutes % 60)}`;
								customerProcessedData.push({
									id: `change-${lastReadingInBlock.id}`,
									isChangeRow: true,
									totalFlow,
									duration: durationStr,
									customer_code:
										lastReadingInBlock.customer_code,
									recorded_at: lastReadingInBlock.recorded_at,
								});
							}
						}
						// Jika block berakhir dengan stop, tambahkan summary stop
						if (
							lastReadingInBlock.operation_type === "stop" &&
							manualBlock.length > 1
						) {
							const totalFlow = manualBlock.reduce(
								(sum, r: { flowMeter: number | string }) =>
									sum + (Number(r.flowMeter) || 0),
								0
							);
							const startTime = new Date(
								manualBlock[0].recorded_at
							);
							const endTime = new Date(
								lastReadingInBlock.recorded_at
							);
							const diffMs =
								endTime.getTime() - startTime.getTime();
							const diffMinutes = Math.floor(diffMs / 60000);
							const pad = (num: number) =>
								String(num).padStart(2, "0");
							const durationStr = `${pad(
								Math.floor(diffMinutes / 60)
							)}:${pad(diffMinutes % 60)}`;
							customerProcessedData.push({
								id: `stop-summary-${lastReadingInBlock.id}`,
								isStopRow: true,
								totalFlow,
								duration: durationStr,
								customer_code: lastReadingInBlock.customer_code,
								recorded_at: lastReadingInBlock.recorded_at,
							});
						}
						i = endIndex + 1;
					} else if (startReading.operation_type === "dumping") {
						let endIndex = i;
						while (
							endIndex + 1 < customerRawData.length &&
							customerRawData[endIndex + 1].operation_type ===
								"dumping"
						) {
							endIndex++;
						}
						const dumpingSourceBlock = customerRawData.slice(
							i,
							endIndex + 1
						);
						customerProcessedData.push(...dumpingSourceBlock);
						const overallStartTime = new Date(
							dumpingSourceBlock[0].recorded_at
						);
						const overallEndTime = new Date(
							dumpingSourceBlock[
								dumpingSourceBlock.length - 1
							].recorded_at
						);
						const diffMs =
							overallEndTime.getTime() -
							overallStartTime.getTime();
						const diffMinutes = Math.floor(diffMs / 60000);
						const pad = (num: number) =>
							String(num).padStart(2, "0");
						const duration = `${pad(
							Math.floor(diffMinutes / 60)
						)}:${pad(diffMinutes % 60)}`;
						customerProcessedData.push({
							id: `dumping-summary-${startReading.id}`,
							isDumpingSummary: true,
							totalFlow: 0,
							duration,
							customer_code: startReading.customer_code,
							recorded_at: overallEndTime.toISOString(),
						});
						i = endIndex + 1;
					} else {
						customerProcessedData.push(startReading);
						i++;
					}
				}
				// --- END LOGIKA PEMROSESAN ---

				let lastSpecialRowIndex = 9;

				const dataForSheet = customerProcessedData.map(
					(row, rowIndex) => {
						const currentRow = 10 + rowIndex;
						let formulaForO = "";

						if (
							("isChangeRow" in row && row.isChangeRow) ||
							"isDumpingTotalRow" in row ||
							("isStopRow" in row && row.isStopRow)
						) {
							const startRow = lastSpecialRowIndex + 1;
							const endRow = currentRow - 1;

							formulaForO = `=IFERROR(IF(OR(E${currentRow}=$A$6,E${currentRow}=$A$5),N${startRow}-N${endRow},IF(N${currentRow}="","",IF(N${endRow}="","",N${endRow}-N${currentRow}))),"-")`;

							lastSpecialRowIndex = currentRow;
						} else {
							const prevRow = currentRow - 1;
							formulaForO = `=IFERROR(IF(OR(E${currentRow}=$A$6,E${currentRow}=$A$5),0,IF(N${currentRow}="","",IF(N${prevRow}="","",N${prevRow}-N${currentRow}))),"-")`;
						}

						if ("isChangeRow" in row && row.isChangeRow) {
							return {
								E: "CHANGE",
								H: row.duration,
								M: Math.round(Number(row.totalFlow)),
								O: { t: "n", f: formulaForO },
							};
						}
						if ("isStopRow" in row && row.isStopRow) {
							const summary = row as StopSummaryRow;
							return {
								E: "STOP",
								H: summary.duration,
								M: Math.round(Number(summary.totalFlow)),
								O: { t: "n", f: formulaForO },
							};
						}
						if ("isDumpingTotalRow" in row) {
							const summary = row as DumpingTotalRow;
							return {
								E: "TOTAL",
								F: summary.storage_number,
								H: summary.duration,
								M: Math.round(Number(summary.totalFlow)),
								O: { t: "n", f: formulaForO },
							};
						}
						if ("isDumpingSummary" in row) {
							return {
								E: 1,
								H: row.duration,
								N: { t: "s", v: "" },
							};
						}

						const reading = row as ReadingWithFlowMeter;
						const d = new Date(reading.recorded_at);
						const timeStr = d.toLocaleTimeString("id-ID", {
							hour: "2-digit",
							minute: "2-digit",
						});

						const storageAsNumber = isNaN(
							parseInt(reading.storage_number)
						)
							? reading.storage_number
							: parseInt(reading.storage_number);

						return {
							E: Number(reading.fixed_storage_quantity),
							F: storageAsNumber,
							G: d,
							H: { t: "s", v: timeStr },
							I: Number(reading.psi),
							J: Number(reading.temp),
							K: Number(reading.psi_out),
							L: Number(reading.flow_turbine),
							M:
								reading.flowMeter !== undefined &&
								reading.flowMeter !== null &&
								String(reading.flowMeter).trim() !== "-"
									? Number(reading.flowMeter)
									: "-",
							O: { t: "n", f: formulaForO },
							Q: reading.remarks,
						};
					}
				);

				XLSX.utils.sheet_add_json(newSheet, dataForSheet, {
					origin: "A10",
					header: [
						"A", "B", "C", "D", "E", "F", "G", "H", "I",
						"J", "K", "L", "M", "N", "O", "P", "Q",
					],
					skipHeader: true,
				});

				// --- MODIFIKASI STYLE DI SINI ---
				const baseStyle = {
					border: {
						top: { style: "thin", color: { rgb: "000000" } },
						bottom: { style: "thin", color: { rgb: "000000" } },
						left: { style: "thin", color: { rgb: "000000" } },
						right: { style: "thin", color: { rgb: "000000" } },
					},
					alignment: { vertical: "center", horizontal: "center" },
				};
				const headerStyle = { ...baseStyle, alignment: { ...baseStyle.alignment, wrapText: true } };
				const blueFill = { fill: { fgColor: { rgb: "00b0f0" } } };
				const yellowFill = { fill: { fgColor: { rgb: "ffff00" } } };
                const redFill = { fill: { fgColor: { rgb: "FFC7CE" } } };
				const tableCols = [ "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q" ];

				const topMergedCols = [ "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q" ];
				const centerAlignment = { alignment: { vertical: "center", horizontal: "center" } };
				[3, 4].forEach((rowNum) => {
					topMergedCols.forEach((col) => {
						const cellAddr = `${col}${rowNum}`;
						const cell = newSheet[cellAddr];
						if (cell) {
							cell.s = { ...(cell.s || {}), ...centerAlignment };
						}
					});
				});

				const topInfoCols = ["I", "J", "K", "L", "M", "N"];
				[5, 6].forEach((rowNum) => {
					topInfoCols.forEach((col) => {
						const cellAddr = `${col}${rowNum}`;
						const cell = newSheet[cellAddr];
						if (!cell) newSheet[cellAddr] = { t: "s", v: "" };
						newSheet[cellAddr].s = { ...(newSheet[cellAddr].s || {}), ...baseStyle };
						if (rowNum === 6 && cell && (cell.t === "n" || cell.f)) {
							if (col === "K") newSheet[cellAddr].s.numFmt = "0";
							else if (col === "L") newSheet[cellAddr].s.numFmt = "#,##0.00";
							else if (col === "M") newSheet[cellAddr].s.numFmt = "0%";
						}
					});
				});

				[8, 9].forEach((rowNum) => {
					tableCols.forEach((col) => {
						const cellAddr = `${col}${rowNum}`;
						if (!newSheet[cellAddr]) newSheet[cellAddr] = { t: "s", v: "" };
						newSheet[cellAddr].s = { ...(newSheet[cellAddr].s || {}), ...headerStyle };
					});
				});

				customerProcessedData.forEach((row, rowIndex) => {
					const currentRow = 10 + rowIndex;
					let rowStyle = { ...baseStyle };

					if ( "isDumpingTotalRow" in row || "isDumpingSummary" in row ) {
						rowStyle = { ...rowStyle, ...blueFill };
					} else if ("isChangeRow" in row) {
						rowStyle = { ...rowStyle, ...yellowFill };
					} else if ("isStopRow" in row) {
                        rowStyle = { ...rowStyle, ...redFill };
                    }

					tableCols.forEach((col) => {
						const cellAddr = `${col}${currentRow}`;
						if (!newSheet[cellAddr]) newSheet[cellAddr] = { t: "s", v: "" };
						const cell = newSheet[cellAddr];
						cell.s = { ...(cell.s || {}), ...rowStyle };
						if (cell.t === "n" || cell.f) {
							if (col === "N" || col === "O") cell.s.numFmt = "#,##0";
							else if (col === "P") cell.s.numFmt = "0%";
						}
					});
				});

				const colsToCheck = [ "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q" ];
				newSheet["!cols"] = colsToCheck.map((col) => {
					let maxLen = 10;
					for ( let rowIndex = 10; rowIndex < 10 + customerProcessedData.length; rowIndex++ ) {
						const cellAddr = `${col}${rowIndex}`;
						const cell = newSheet[cellAddr];
						if (cell && cell.v) {
							maxLen = Math.max(maxLen, cell.v.toString().length);
						}
					}
					return { wch: maxLen + 2 };
				});

				XLSX.utils.book_append_sheet(workbook, newSheet, customerCode);
			});

			delete workbook.Sheets[templateSheetName];
			workbook.SheetNames = workbook.SheetNames.filter(
				(name) => name !== templateSheetName
			);

			XLSX.writeFile(
				workbook,
				`Laporan-Bulanan-${new Date().toISOString().split("T")[0]}.xlsm`
			);
            setIsExportDialogOpen(false); // Tutup dialog setelah berhasil
            setSelectedCustomersForExport([]); // Reset pilihan
		} catch (error) {
			console.error("Gagal melakukan export:", error);
			toast.error("Gagal Export", {
				description:
					error instanceof Error
						? error.message
						: "Terjadi kesalahan.",
			});
		} finally {
			setIsExporting(false);
		}
	};
    
    // --- HANDLER BARU UNTUK CHECKBOX ---
    const handleExportCustomerSelection = (customerCode: string, isChecked: boolean) => {
        setSelectedCustomersForExport(prev => {
            if (isChecked) {
                return [...prev, customerCode];
            } else {
                return prev.filter(code => code !== customerCode);
            }
        });
    };

    const handleSelectAllForExport = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedCustomersForExport(uniqueCustomersInView);
        } else {
            setSelectedCustomersForExport([]);
        }
    };

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Customers
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{uniqueCustomers.length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Operators
						</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{uniqueOperators.length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Today&apos;s Readings
						</CardTitle>
						<Database className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{todayReadings}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Readings
						</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{allReadingsForStats.length}
						</div>
					</CardContent>
				</Card>
			</div>
			<Tabs
				defaultValue="data"
				className="space-y-4">
				<TabsList>
					<TabsTrigger value="data">Data Browser</TabsTrigger>
					<TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
				</TabsList>

				<TabsContent
					value="data"
					className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Filter & Export Data</CardTitle>
							<CardDescription>
								Gunakan filter untuk mencari data spesifik, lalu
								ekspor ke Excel.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col md:flex-row gap-4 mb-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search by customer or operator..."
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											className="pl-10"
										/>
									</div>
								</div>
								<Select
									value={timeRange}
									onValueChange={(
										value: "day" | "week" | "month" | "all"
									) => setTimeRange(value)}>
									<SelectTrigger className="w-full md:w-[180px]">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											<SelectValue placeholder="Pilih Waktu..." />
										</div>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="day">
											Hari Ini
										</SelectItem>
										<SelectItem value="week">
											Minggu Ini
										</SelectItem>
										<SelectItem value="month">
											Bulan Ini
										</SelectItem>
										<SelectItem value="all">
											Semua Waktu
										</SelectItem>
									</SelectContent>
								</Select>
								<Select
									value={selectedCustomer}
									onValueChange={setSelectedCustomer}>
									<SelectTrigger className="w-full md:w-[180px]">
										<SelectValue placeholder="All Customers" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Customers
										</SelectItem>
										{uniqueCustomers.map((customer) => (
											<SelectItem
												key={customer}
												value={customer}>
												{customer}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									value={selectedOperator}
									onValueChange={setSelectedOperator}>
									<SelectTrigger className="w-full md:w-[180px]">
										<SelectValue placeholder="All Operators" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Operators
										</SelectItem>
										{uniqueOperators.map((operator) => (
											<SelectItem
												key={operator}
												value={operator}>
												{operator}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									value={sortOrder}
									onValueChange={(value: "asc" | "desc") =>
										setSortOrder(value)
									}>
									<SelectTrigger className="w-full md:w-[180px]">
										<div className="flex items-center gap-2">
											<ArrowUpDown className="h-4 w-4" />
											<SelectValue placeholder="Urutkan..." />
										</div>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="asc">
											Terlama (Asc)
										</SelectItem>
										<SelectItem value="desc">
											Terbaru (Desc)
										</SelectItem>
									</SelectContent>
								</Select>
                                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 bg-transparent"
                                            disabled={isExporting}
                                        >
                                            <Download className="h-4 w-4" />
                                            Export
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Pilih Pelanggan untuk Diekspor</DialogTitle>
                                            <DialogDescription>
                                                Pilih satu atau lebih pelanggan dari daftar di bawah ini untuk dimasukkan ke dalam file laporan.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="select-all-export"
                                                    checked={selectedCustomersForExport.length === uniqueCustomersInView.length && uniqueCustomersInView.length > 0}
                                                    onCheckedChange={(checked) => handleSelectAllForExport(checked as boolean)}
                                                />
                                                <Label htmlFor="select-all-export" className="font-medium">
                                                    Pilih Semua
                                                </Label>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-4">
                                                {uniqueCustomersInView.map(customerCode => (
                                                    <div key={customerCode} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`export-${customerCode}`}
                                                            checked={selectedCustomersForExport.includes(customerCode)}
                                                            onCheckedChange={(checked) => handleExportCustomerSelection(customerCode, checked as boolean)}
                                                        />
                                                        <Label htmlFor={`export-${customerCode}`}>{customerCode}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Batal</Button>
                                            </DialogClose>
                                            <Button onClick={handleExport} disabled={isExporting || selectedCustomersForExport.length === 0}>
                                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                                Lanjutkan Export ({selectedCustomersForExport.length})
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Data Entries</CardTitle>
							<CardDescription>
								Menampilkan {processedReadings.length} dari total data yang difilter.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Customer</TableHead>
											<TableHead>Jml. Storage</TableHead>
											<TableHead>Storage</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>PSI</TableHead>
											<TableHead>Temp</TableHead>
											<TableHead>PSI Out</TableHead>
											<TableHead>Flow/Turbin</TableHead>
											<TableHead>Flow Meter</TableHead>
											<TableHead>Operator</TableHead>
											<TableHead>Remarks</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{isLoading ? (
											<TableRow>
												<TableCell
													colSpan={13}
													className="text-center py-8">
													<Loader2 className="h-6 w-6 animate-spin mx-auto" />
												</TableCell>
											</TableRow>
										) : processedReadings.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={13}
													className="text-center text-gray-500 py-8">
													No entries match your
													filters
												</TableCell>
											</TableRow>
										) : (
											processedReadings.map((row) => {
												if (
													"isChangeRow" in row &&
													row.isChangeRow
												) {
													return (
														<TableRow
															key={row.id}
															className="bg-yellow-100 hover:bg-yellow-200 font-bold text-yellow-900">
															<TableCell>
																CHANGE
															</TableCell>
															<TableCell
																colSpan={
																	2
																}></TableCell>
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
															<TableCell
																colSpan={
																	4
																}></TableCell>
															<TableCell>
																{Math.round(
																	row.totalFlow
																)}
															</TableCell>
															<TableCell
																colSpan={
																	3
																}></TableCell>
														</TableRow>
													);
												}
												if (
													"isStopRow" in row &&
													row.isStopRow
												) {
													const summary =
														row as StopSummaryRow;
													return (
														<TableRow
															key={summary.id}
															className="bg-red-200 hover:bg-red-300 font-bold text-red-900">
															<TableCell>
																STOP
															</TableCell>
															<TableCell
																colSpan={
																	2
																}></TableCell>
															<TableCell>
																{
																	formatDateTime(
																		summary.recorded_at
																	).date
																}
															</TableCell>
															<TableCell>
																{
																	summary.duration
																}
															</TableCell>
															<TableCell
																colSpan={
																	4
																}></TableCell>
															<TableCell>
																{Math.round(
																	summary.totalFlow
																)}
															</TableCell>
															<TableCell
																colSpan={
																	3
																}></TableCell>
														</TableRow>
													);
												}
												if (
													"isDumpingTotalRow" in row
												) {
													const summary =
														row as DumpingTotalRow;
													return (
														<TableRow
															key={summary.id}
															className="bg-blue-200 hover:bg-blue-300 font-bold text-blue-900">
															<TableCell>
																TOTAL
															</TableCell>
															<TableCell></TableCell>
															<TableCell>
																{
																	summary.storage_number
																}
															</TableCell>
															<TableCell>
																{
																	formatDateTime(
																		summary.recorded_at
																	).date
																}
															</TableCell>
															<TableCell>
																{
																	summary.duration
																}
															</TableCell>
															<TableCell
																colSpan={
																	4
																}></TableCell>
															<TableCell>
																{Math.round(
																	summary.totalFlow
																)}
															</TableCell>
															<TableCell
																colSpan={
																	3
																}></TableCell>
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
															<TableCell
																colSpan={
																	4
																}></TableCell>
															<TableCell>
																{row.duration}
															</TableCell>
															<TableCell
																colSpan={
																	8
																}></TableCell>
														</TableRow>
													);
												}

												const reading =
													row as ReadingWithFlowMeter;
												const { date, time } =
													formatDateTime(
														reading.recorded_at
													);
												return (
													<TableRow key={reading.id}>
														<TableCell>
															<Badge variant="outline">
																{
																	reading.customer_code
																}
															</Badge>
														</TableCell>
														<TableCell className="font-semibold">
															{
																reading.fixed_storage_quantity
															}
														</TableCell>
														<TableCell>
															{
																reading.storage_number
															}
														</TableCell>
														<TableCell>
															{date}
														</TableCell>
														<TableCell>
															<HoverCard>
																<HoverCardTrigger
																	asChild>
																	<span className="cursor-pointer underline decoration-dotted">
																		{time}
																	</span>
																</HoverCardTrigger>
																<HoverCardContent className="w-80">
																	<div className="flex justify-between space-x-4">
																		<Clock className="h-6 w-6 mt-1" />
																		<div className="space-y-1">
																			<h4 className="text-sm font-semibold">
																				Waktu
																				Submit
																				Aktual
																			</h4>
																			<p className="text-sm">
																				Data
																				ini
																				dicatat
																				oleh
																				sistem
																				pada:
																			</p>
																			<div className="flex items-center pt-2">
																				<span className="text-xs text-muted-foreground">
																					{formatTimestampForHover(
																						reading.created_at
																					)}
																				</span>
																			</div>
																		</div>
																	</div>
																</HoverCardContent>
															</HoverCard>
														</TableCell>
														<TableCell>
															{String(
																reading.psi
															)}
														</TableCell>
														<TableCell>
															{String(
																reading.temp
															)}
															°C
														</TableCell>
														<TableCell>
															{String(
																reading.psi_out
															)}
														</TableCell>
														<TableCell>
															{String(
																reading.flow_turbine
															)}
														</TableCell>
														<TableCell>
															{reading.flowMeter}
														</TableCell>
														<TableCell>
															{reading.profiles
																?.username ||
																"N/A"}
														</TableCell>
														<TableCell>
															{reading.remarks ||
																"-"}
														</TableCell>
														<TableCell>
															<Dialog
																open={
																	isEditDialogOpen &&
																	selectedReading?.id ===
																		reading.id
																}
																onOpenChange={
																	setIsEditDialogOpen
																}>
																<AlertDialog>
																	<DropdownMenu>
																		<DropdownMenuTrigger
																			asChild>
																			<Button
																				variant="ghost"
																				className="h-8 w-8 p-0">
																				<span className="sr-only">
																					Open
																					menu
																				</span>
																				<MoreHorizontal className="h-4 w-4" />
																			</Button>
																		</DropdownMenuTrigger>
																		<DropdownMenuContent align="end">
																			<DialogTrigger
																				asChild>
																				<DropdownMenuItem
																					onClick={() =>
																						handleEditClick(
																							reading
																						)
																					}>
																					<Edit className="mr-2 h-4 w-4" />
																					<span>
																						Edit
																					</span>
																				</DropdownMenuItem>
																			</DialogTrigger>
																			<AlertDialogTrigger
																				asChild>
																				<DropdownMenuItem>
																					<Trash2 className="mr-2 h-4 w-4" />
																					<span>
																						Hapus
																					</span>
																				</DropdownMenuItem>
																			</AlertDialogTrigger>
																		</DropdownMenuContent>
																	</DropdownMenu>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>
																				Apakah
																				Anda
																				yakin?
																			</AlertDialogTitle>
																			<AlertDialogDescription>
																				Tindakan
																				ini
																				akan
																				menghapus
																				data
																				secara
																				permanen.
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>
																				Batal
																			</AlertDialogCancel>
																			<AlertDialogAction
																				onClick={() =>
																					handleDelete(
																						reading.id
																					)
																				}>
																				Ya,
																				Hapus
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
																<DialogContent>
																	<DialogHeader>
																		<DialogTitle>
																			Edit
																			Data
																			Reading
																		</DialogTitle>
																	</DialogHeader>
																	{selectedReading && (
																		<EditReadingForm
																			reading={
																				selectedReading
																			}
																			onSuccess={() => {
																				setIsEditDialogOpen(
																					false
																				);
																				setSelectedReading(
																					null
																				);
																			}}
																		/>
																	)}
																</DialogContent>
															</Dialog>
														</TableCell>
													</TableRow>
												);
											})
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="bulk">
					<BulkOperations />
				</TabsContent>
			</Tabs>
		</div>
	);
}