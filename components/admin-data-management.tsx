"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useAllReadings } from "@/hooks/use-readings";
import * as XLSX from "xlsx";
import type { ReadingWithFlowMeter } from "@/types/data";

export function AdminDataManagement() {
	const { data: allReadings = [], isLoading } = useAllReadings();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState("all");
	const [selectedOperator, setSelectedOperator] = useState("all");
	const [isExporting, setIsExporting] = useState(false);
	``;
	const { uniqueCustomers, uniqueOperators, todayReadings } = useMemo(() => {
		const customers = Array.from(
			new Set(allReadings.map((r) => r.customer_code))
		);
		const operators = Array.from(
			new Set(allReadings.map((r) => r.profiles?.username || "Unknown"))
		);
		const today = new Date().toDateString();
		const readingsToday = allReadings.filter(
			(r) => new Date(r.created_at).toDateString() === today
		).length;
		return {
			uniqueCustomers: customers,
			uniqueOperators: operators,
			todayReadings: readingsToday,
		};
	}, [allReadings]);

	const filteredData = useMemo(() => {
		return allReadings.filter((item) => {
			const operatorUsername =
				item.profiles?.username?.toLowerCase() || "";
			const matchesSearch =
				item.customer_code
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				operatorUsername.includes(searchTerm.toLowerCase());
			const matchesCustomer =
				selectedCustomer === "all" ||
				item.customer_code === selectedCustomer;
			const matchesOperator =
				selectedOperator === "all" ||
				item.profiles?.username === selectedOperator;
			return matchesSearch && matchesCustomer && matchesOperator;
		});
	}, [allReadings, searchTerm, selectedCustomer, selectedOperator]);

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
			}),
		};
	};

	const handleExport = async () => {
		if (filteredData.length === 0) {
			alert("Tidak ada data untuk diekspor.");
			return;
		}
		setIsExporting(true);
		try {
			// Mengambil file template dari folder public
			const response = await fetch("/template-laporan.xlsm");
			if (!response.ok) {
				throw new Error(
					"Gagal memuat file template. Pastikan file 'template-laporan.xlsm' ada di dalam folder /public."
				);
			}
			const arrayBuffer = await response.arrayBuffer();
			const workbook = XLSX.read(arrayBuffer, { type: "buffer" });

			const customersToExport = Array.from(
				new Set(filteredData.map((r) => r.customer_code))
			);
			const templateSheetName = "sheet1";
			const templateWorksheet = workbook.Sheets[templateSheetName];
			if (!templateWorksheet) {
				throw new Error(
					`Sheet dengan nama "${templateSheetName}" tidak ditemukan di template.`
				);
			}

			customersToExport.forEach((customer) => {
				const newSheet = JSON.parse(JSON.stringify(templateWorksheet));
				const customerData = filteredData.filter(
					(row) => row.customer_code === customer
				);

				const dataForSheet = customerData.map((row) => {
					const timestampDate = new Date(row.created_at);
					const storageAsNumber = isNaN(parseInt(row.storage_number))
						? row.storage_number
						: parseInt(row.storage_number);
					const flowMeterAsNumber =
						typeof row.flowMeter === "string"
							? row.flowMeter
							: Number(row.flowMeter);

					return [
						null,
						null,
						null,
						null,
						Number(row.fixed_storage_quantity),
						storageAsNumber,
						timestampDate, // Kolom G (Date)
						timestampDate, // Kolom H (Time)
						Number(row.psi),
						Number(row.temp),
						Number(row.psi_out),
						Number(row.flow_turbine),
						flowMeterAsNumber,
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

				// Set format tanggal dan waktu secara eksplisit
				customerData.forEach((_, rowIndex) => {
					const currentRow = 10 + rowIndex;
					const dateCellAddress = `G${currentRow}`;
					if (newSheet[dateCellAddress]) {
						newSheet[dateCellAddress].z = "dd/mm/yyyy";
					}
					const timeCellAddress = `H${currentRow}`;
					if (newSheet[timeCellAddress]) {
						newSheet[timeCellAddress].z = "hh:mm:ss";
					}
				});

				XLSX.utils.book_append_sheet(workbook, newSheet, customer);
			});

			// Hapus sheet template setelah selesai
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
			alert(
				`Gagal melakukan export: ${
					error instanceof Error
						? error.message
						: "Kesalahan tidak diketahui."
				}`
			);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Kartu Statistik */}
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
						<p className="text-xs text-muted-foreground">
							Active monitoring sites
						</p>
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
						<p className="text-xs text-muted-foreground">
							Total operators
						</p>
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
						<p className="text-xs text-muted-foreground">
							Data points collected
						</p>
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
							{allReadings.length}
						</div>
						<p className="text-xs text-muted-foreground">
							All time entries
						</p>
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
								Menampilkan {filteredData.length} dari{" "}
								{allReadings.length} data
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
										) : filteredData.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={11}
													className="text-center text-gray-500 py-8">
													No entries match your
													filters
												</TableCell>
											</TableRow>
										) : (
											filteredData.map(
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
															{/* Kolom Baru */}
															<TableCell className="font-semibold">
																{
																	row.fixed_storage_quantity
																}
															</TableCell>
															<TableCell className="font-mono text-sm">
																{date}
															</TableCell>
															<TableCell className="font-mono text-sm">
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
