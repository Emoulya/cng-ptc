"use client";

import { useState } from "react";
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
import { Trash2, ShieldAlert } from "lucide-react";
import { useData } from "@/contexts/data-context";

export function BulkOperations() {
	const { getAllReadings, deleteReading } = useData();
	const allReadings = getAllReadings();

	const [selectedItems, setSelectedItems] = useState<string[]>([]);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedItems(allReadings.map((item) => item.id));
		} else {
			setSelectedItems([]);
		}
	};

	const handleSelectItem = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedItems([...selectedItems, id]);
		} else {
			setSelectedItems(selectedItems.filter((item) => item !== id));
		}
	};

	const handleDeleteSelected = () => {
		if (selectedItems.length === 0) {
			toast.warning("Tidak Ada Data Terpilih", {
				description: "Harap pilih data yang ingin Anda hapus.",
			});
			return;
		}

		selectedItems.forEach((id) => deleteReading(id));
		toast.success("Data Terhapus", {
			description: `Berhasil menghapus ${selectedItems.length} data.`,
		});

		setSelectedItems([]);
	};

	const handleClearAllData = () => {
		// Menggunakan confirm() bawaan browser untuk kemudahan
		if (
			confirm(
				"APAKAH ANDA YAKIN? Semua data monitoring akan dihapus secara permanen dan tidak dapat dikembalikan."
			)
		) {
			allReadings.forEach((reading) => deleteReading(reading.id));
			toast.error("Semua Data Telah Dihapus", {
				description: "Berhasil menghapus seluruh data gas storage.",
			});
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
					<ShieldAlert className="h-5 w-5" />
					Operasi Penghapusan Data
				</CardTitle>
				<CardDescription>
					Hapus beberapa data sekaligus. Harap berhati-hati, aksi ini
					tidak dapat dibatalkan.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{allReadings.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							Tidak ada data untuk dihapus.
						</div>
					) : (
						<>
							{/* Data Selection */}
							<div className="border rounded-lg">
								<div className="p-3 border-b bg-gray-50 flex items-center gap-3">
									<Checkbox
										checked={
											selectedItems.length > 0 &&
											selectedItems.length ===
												allReadings.length
										}
										onCheckedChange={handleSelectAll}
										aria-label="Select all items"
									/>
									<span className="text-sm font-medium">
										Pilih Semua ({selectedItems.length} dari{" "}
										{allReadings.length} dipilih)
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
															item.timestamp
														)}
													</span>
													<span className="text-gray-500">
														•
													</span>
													<span className="font-medium">
														{item.customer}
													</span>
													<span className="text-gray-500">
														•
													</span>
													<span>{item.operator}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Tombol Aksi */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Button
									onClick={handleDeleteSelected}
									disabled={selectedItems.length === 0}
									variant="destructive">
									<Trash2 className="h-4 w-4 mr-2" />
									Hapus Data Terpilih ({selectedItems.length})
								</Button>
								<Button
									variant="outline"
									className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
									onClick={handleClearAllData}
									disabled={allReadings.length === 0}>
									<Trash2 className="h-4 w-4 mr-2" />
									Hapus Semua Data
								</Button>
							</div>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
