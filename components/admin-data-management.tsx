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
} from "lucide-react";
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
import { useAllReadings, useDeleteReading } from "@/hooks/use-readings";
import { EditReadingForm } from "./edit-reading-form";
import { useCustomers } from "@/hooks/use-customers";
import * as XLSX from "xlsx";
import type { ReadingWithFlowMeter } from "@/types/data";
import { toast } from "sonner";

// --- Hook custom untuk debounce ---
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
	// State untuk filter UI
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState("all");
	const [selectedOperator, setSelectedOperator] = useState("all");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [isExporting, setIsExporting] = useState(false);
	const { mutate: deleteReading } = useDeleteReading();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedReading, setSelectedReading] =
		useState<ReadingWithFlowMeter | null>(null);

	// Debounce search term untuk mencegah API call berlebihan saat mengetik
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// Gabungkan semua filter menjadi satu objek untuk dikirim ke hook
	const filters = useMemo(
		() => ({
			customer: selectedCustomer,
			operator: selectedOperator,
			searchTerm: debouncedSearchTerm,
			sortOrder: sortOrder,
		}),
		[selectedCustomer, selectedOperator, debouncedSearchTerm, sortOrder]
	);

	const { data: readings = [], isLoading } = useAllReadings(filters);
	const { data: customers = [] } = useCustomers();
	const { data: allReadingsForStats = [] } = useAllReadings({
		customer: "all",
		operator: "all",
		searchTerm: "",
		sortOrder: "asc",
	});

	const { uniqueCustomers, uniqueOperators, todayReadings } = useMemo(() => {
		const customersSet = new Set(
			allReadingsForStats.map((r) => r.customer_code)
		);
		const operatorsSet = new Set(
			allReadingsForStats.map((r) => r.profiles?.username || "Unknown")
		);
		const today = new Date().toDateString();
		const readingsToday = allReadingsForStats.filter(
			(r) => new Date(r.created_at).toDateString() === today
		).length;
		return {
			uniqueCustomers: Array.from(customersSet),
			uniqueOperators: Array.from(operatorsSet),
			todayReadings: readingsToday,
		};
	}, [allReadingsForStats]);

	const formatDateTimeForDisplay = (timestamp: string) => {
		const date = new Date(timestamp);
		return {
			date: date.toLocaleDateString("id-ID", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}),
			time: date.toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				timeZone: "UTC",
			}),
		};
	};

	const handleExport = async () => {
		if (readings.length === 0) {
			toast.warning("Tidak ada data untuk diekspor.");
			return;
		}
		setIsExporting(true);
		try {
			const response = await fetch("/template-laporan.xlsm");
			if (!response.ok) {
				throw new Error("Gagal memuat file template.");
			}
			const arrayBuffer = await response.arrayBuffer();
			const workbook = XLSX.read(arrayBuffer, { type: "buffer" });

			const customersToExport = Array.from(
				new Set(readings.map((r) => r.customer_code))
			);
			const templateSheetName = "sheet1";
			const templateWorksheet = workbook.Sheets[templateSheetName];
			if (!templateWorksheet) {
				throw new Error("Sheet 'sheet1' tidak ditemukan.");
			}

			customersToExport.forEach((customerCode) => {
				const newSheet = JSON.parse(JSON.stringify(templateWorksheet));

				const customerInfo = customers.find(
					(c) => c.code === customerCode
				);
				const customerName = customerInfo?.name || customerCode;
				const cellAddress = "I5";
				const cell = { t: "s", v: `PT. ${customerName}` };
				newSheet[cellAddress] = cell;
				if (!newSheet["!merges"]) newSheet["!merges"] = [];
				newSheet["!merges"].push({
					s: { r: 4, c: 8 },
					e: { r: 5, c: 10 },
				});

				const customerData = readings.filter(
					(row) => row.customer_code === customerCode
				);

				const dataForSheet = customerData.map((row) => {
					const d = new Date(row.created_at);
					const timezoneOffset = d.getTimezoneOffset() * 60000;
					const correctedDate = new Date(
						d.getTime() + timezoneOffset
					);

					const storageAsNumber = isNaN(parseInt(row.storage_number))
						? row.storage_number
						: parseInt(row.storage_number);

					const flowMeterValue =
						row.flowMeter === "" ? "" : Number(row.flowMeter);

					return [
						null,
						null,
						null,
						null,
						Number(row.fixed_storage_quantity),
						storageAsNumber,
						correctedDate,
						correctedDate,
						Number(row.psi),
						Number(row.temp),
						Number(row.psi_out),
						Number(row.flow_turbine),
						flowMeterValue,
						null,
						null,
						null,
						row.remarks,
					];
				});

				XLSX.utils.sheet_add_aoa(newSheet, dataForSheet, {
					origin: "A10",
					cellDates: true,
				});

				customerData.forEach((_, rowIndex) => {
					const currentRow = 10 + rowIndex;
					const dateCellAddress = `G${currentRow}`;
					if (newSheet[dateCellAddress]) {
						newSheet[dateCellAddress].z = "dd/mm/yyyy";
					}
					const timeCellAddress = `H${currentRow}`;
					if (newSheet[timeCellAddress]) {
						newSheet[timeCellAddress].z = "hh:mm";
					}
					const cellN = `N${currentRow}`;
					if (newSheet[cellN]) {
						newSheet[cellN].z = "#,##0;[Red]-#,##0";
					}
					const cellO = `O${currentRow}`;
					if (newSheet[cellO]) {
						newSheet[cellO].z = "#,##0;[Red]-#,##0";
					}
					const cellP = `P${currentRow}`;
					if (newSheet[cellP]) {
						newSheet[cellP].z = "0.00%";
					}
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

	const handleDelete = (id: number) => {
		deleteReading(id);
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
							Today's Readings
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

								<Button
									variant="outline"
									className="flex items-center gap-2 bg-transparent"
									onClick={handleExport}
									disabled={isExporting}>
									{isExporting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Download className="h-4 w-4" />
									)}
									Export
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Data Entries</CardTitle>
							<CardDescription>
								Menampilkan {readings.length} dari{" "}
								{allReadingsForStats.length} data
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Customer</TableHead>
											<TableHead>Storage</TableHead>
											<TableHead>Jml. Storage</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>PSI</TableHead>
											<TableHead>Temp</TableHead>
											<TableHead>PSI Out</TableHead>
											<TableHead>Flow/Turbin</TableHead>
											<TableHead>Flow Meter</TableHead>
											<TableHead>Operator</TableHead>
											<TableHead>Remarks</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{isLoading ? (
											<TableRow>
												<TableCell
													colSpan={12}
													className="text-center py-8">
													<Loader2 className="h-6 w-6 animate-spin mx-auto" />
												</TableCell>
											</TableRow>
										) : readings.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={12}
													className="text-center text-gray-500 py-8">
													No entries match your
													filters
												</TableCell>
											</TableRow>
										) : (
											readings.map(
												(row: ReadingWithFlowMeter) => {
													const { date, time } =
														formatDateTimeForDisplay(
															row.created_at
														);
													return (
														<TableRow key={row.id}>
															<TableCell>
																<Badge variant="outline">
																	{
																		row.customer_code
																	}
																</Badge>
															</TableCell>
															<TableCell>
																{
																	row.storage_number
																}
															</TableCell>
															<TableCell className="font-semibold">
																{
																	row.fixed_storage_quantity
																}
															</TableCell>
															<TableCell>
																{date}
															</TableCell>
															<TableCell>
																{time}
															</TableCell>
															<TableCell>
																{String(
																	row.psi
																)}
															</TableCell>
															<TableCell>
																{String(
																	row.temp
																)}
																°C
															</TableCell>
															<TableCell>
																{String(
																	row.psi_out
																)}
															</TableCell>
															<TableCell>
																{String(
																	row.flow_turbine
																)}
															</TableCell>
															<TableCell>
																{row.flowMeter}
															</TableCell>
															<TableCell>
																{row.profiles
																	?.username ||
																	"N/A"}
															</TableCell>
															<TableCell>
																{row.remarks ||
																	"-"}
															</TableCell>
																														<TableCell>
																<Dialog
																	open={
																		isEditDialogOpen &&
																		selectedReading
																			?.id ===
																			row.id
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
																							setSelectedReading(
																								row
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
																							row.id
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
												}
											)
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
