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
import { toast } from "sonner";
import { Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { useAllReadings, useDeleteReading } from "@/hooks/use-readings";
import { deleteAllReadings } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export function BulkOperations() {
	const queryClient = useQueryClient();

	// Panggil useAllReadings dengan filter default untuk mengambil semua data
	const { data: allReadings = [], isLoading } = useAllReadings({
		customer: "all",
		operator: "all",
		searchTerm: "",
		sortOrder: "asc",
	});

	const { mutate: deleteReading, isPending: isDeletingSingle } =
		useDeleteReading();
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [isDeletingAll, setIsDeletingAll] = useState(false);

	const handleSelectAll = (checked: boolean) => {
		setSelectedItems(checked ? allReadings.map((item) => item.id) : []);
	};

	const handleSelectItem = (id: number, checked: boolean) => {
		setSelectedItems(
			checked
				? [...selectedItems, id]
				: selectedItems.filter((item) => item !== id)
		);
	};

	const handleDeleteSelected = async () => {
		if (selectedItems.length === 0) {
			toast.warning("Tidak ada data yang dipilih", {
				description: "Silakan pilih data yang ingin Anda hapus.",
			});
			return;
		}
		await Promise.all(selectedItems.map((id) => deleteReading(id)));
		toast.success("Data Terhapus", {
			description: `Berhasil menghapus ${selectedItems.length} entri data.`,
		});
		setSelectedItems([]);
	};

	const handleClearAllData = async () => {
		setIsDeletingAll(true);
		try {
			// Panggil fungsi API yang baru, bukan supabase langsung
			await deleteAllReadings();

			toast.error("Semua Data Telah Dihapus", {
				description: "Berhasil menghapus semua data gas storage.",
			});

			queryClient.invalidateQueries({ queryKey: ["readings"] });
			setSelectedItems([]);
		} catch (error: any) {
			toast.error("Gagal Menghapus Semua Data", {
				description: error.message,
			});
		} finally {
			setIsDeletingAll(false);
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

	const isProcessing = isDeletingSingle || isDeletingAll;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShieldAlert className="h-5 w-5" /> Operasi Hapus Data
				</CardTitle>
				<CardDescription>
					Hapus beberapa entri data sekaligus. Harap berhati-hati,
					tindakan ini tidak dapat dibatalkan.
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
							Tidak ada data untuk dihapus.
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
										selectedItems.length === 0 ||
										isProcessing
									}
									variant="destructive">
									{isDeletingSingle ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4 mr-2" />
									)}
									Hapus Pilihan ({selectedItems.length})
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
											disabled={
												allReadings.length === 0 ||
												isProcessing
											}>
											{isDeletingAll ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Trash2 className="h-4 w-4 mr-2" />
											)}
											Hapus Semua Data
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												APAKAH ANDA YAKIN?
											</AlertDialogTitle>
											<AlertDialogDescription>
												Tindakan ini akan{" "}
												<span className="font-bold text-red-600">
													menghapus SEMUA data
													monitoring
												</span>{" "}
												secara permanen dan tidak dapat
												dipulihkan.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>
												Batal
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleClearAllData}>
												Ya, Hapus Semua
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
