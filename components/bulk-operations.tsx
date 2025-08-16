"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { useData } from "@/contexts/data-context";
import type { ReadingWithFlowMeter } from "@/contexts/data-context";

export function BulkOperations() {
	const { getAllReadings, deleteReading, clearAllData } = useData();
	const [allReadings, setAllReadings] = useState<ReadingWithFlowMeter[]>([]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchAllData = async () => {
		setIsLoading(true);
		try {
			const data = await getAllReadings();
			setAllReadings(data);
		} catch (error) {
			toast.error("Failed to load data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAllData();
	}, []); // Dependensi kosong agar hanya berjalan sekali saat komponen dimuat

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedItems(allReadings.map((item) => item.id));
		} else {
			setSelectedItems([]);
		}
	};

	const handleSelectItem = (id: number, checked: boolean) => {
		if (checked) {
			setSelectedItems([...selectedItems, id]);
		} else {
			setSelectedItems(selectedItems.filter((item) => item !== id));
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedItems.length === 0) {
			toast.warning("No Data Selected", {
				description: "Please select the data you want to delete.",
			});
			return;
		}

		setIsDeleting(true);
		try {
			// Hapus satu per satu
			await Promise.all(selectedItems.map((id) => deleteReading(id)));

			toast.success("Data Deleted", {
				description: `Successfully deleted ${selectedItems.length} data entries.`,
			});

			// Reset state dan muat ulang data
			setSelectedItems([]);
			await fetchAllData();
		} catch (error: any) {
			toast.error("Deletion Failed", { description: error.message });
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClearAllData = async () => {
		if (
			confirm(
				"ARE YOU SURE? All monitoring data will be permanently deleted and cannot be recovered."
			)
		) {
			setIsDeleting(true);
			try {
				await clearAllData();
				toast.error("All Data Has Been Deleted", {
					description: "Successfully deleted all gas storage data.",
				});
				setSelectedItems([]);
				await fetchAllData(); // Muat ulang data (seharusnya kosong)
			} catch (error: any) {
				toast.error("Deletion Failed", { description: error.message });
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const formatTimestamp = (timestamp: string) => {
		return new Date(timestamp).toLocaleString("id-ID", {
			timeZone: "Asia/Jakarta",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShieldAlert className="h-5 w-5" /> Data Deletion Operations
				</CardTitle>
				<CardDescription>
					Delete multiple data entries at once. Please be careful,
					this action cannot be undone.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{isLoading ? (
						<div className="text-center py-8">
							<Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
						</div>
					) : allReadings.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							No data available to delete.
						</div>
					) : (
						<>
							<div className="border rounded-lg">
								<div className="p-3 border-b bg-gray-50 flex items-center gap-3">
									<Checkbox
										checked={
											selectedItems.length > 0 &&
											selectedItems.length ===
												allReadings.length
										}
										onCheckedChange={(checked) =>
											handleSelectAll(checked as boolean)
										}
										aria-label="Select all items"
									/>
									<span className="text-sm font-medium">
										Select All ({selectedItems.length} of{" "}
										{allReadings.length} selected)
									</span>
								</div>
								<div className="divide-y max-h-60 overflow-y-auto">
									{allReadings.map((item) => (
										<div
											key={item.id}
											className="p-3 flex items-center gap-3">
											<Checkbox
												checked={selectedItems.includes(
													item.id
												)}
												onCheckedChange={(checked) =>
													handleSelectItem(
														item.id,
														checked as boolean
													)
												}
												aria-label={`Select item ${item.id}`}
											/>
											<div className="flex-1">
												<div className="flex items-center gap-2 text-sm">
													<span className="font-mono">
														{formatTimestamp(
															item.created_at
														)}
													</span>
													<span className="text-gray-500">
														•
													</span>
													<span className="font-medium">
														{item.customer_code}
													</span>
													<span className="text-gray-500">
														•
													</span>
													<span>
														{item.profiles
															?.username || "N/A"}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Button
									onClick={handleDeleteSelected}
									disabled={
										selectedItems.length === 0 || isDeleting
									}
									variant="destructive">
									{isDeleting ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4 mr-2" />
									)}
									Delete Selected ({selectedItems.length})
								</Button>
								<Button
									variant="outline"
									className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
									onClick={handleClearAllData}
									disabled={
										allReadings.length === 0 || isDeleting
									}>
									{isDeleting ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4 mr-2" />
									)}
									Clear All Data
								</Button>
							</div>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
