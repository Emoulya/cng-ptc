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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
	useStorages,
	useAddStorage,
	useDeleteStorage,
} from "@/hooks/use-storages";
import { useCustomers } from "@/hooks/use-customers";

export function StorageManagement() {
	const { data: storages = [], isLoading } = useStorages();
	const { data: customers = [] } = useCustomers();
	const { mutate: addStorage, isPending: isSubmitting } = useAddStorage();
	const { mutate: deleteStorage } = useDeleteStorage();

	// State baru untuk form yang lebih kompleks
	const [newStorageNumber, setNewStorageNumber] = useState("");
	const [newStorageType, setNewStorageType] = useState<"mobile" | "fixed">(
		"mobile"
	);
	const [selectedCustomerCode, setSelectedCustomerCode] = useState("");
	const [defaultQuantity, setDefaultQuantity] = useState("");

	const handleAddStorage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newStorageNumber) {
			toast.warning("Nomor Storage harus diisi");
			return;
		}

		// Validasi tambahan untuk tipe 'fixed'
		if (newStorageType === "fixed") {
			if (!selectedCustomerCode || !defaultQuantity) {
				toast.warning(
					"Untuk storage 'fixed', Pelanggan dan Jumlah Bawaan harus diisi."
				);
				return;
			}
		}

		addStorage(
			{
				storage_number: newStorageNumber,
				type: newStorageType,
				customer_code:
					newStorageType === "fixed" ? selectedCustomerCode : null,
				default_quantity:
					newStorageType === "fixed"
						? parseInt(defaultQuantity)
						: null,
			},
			{
				onSuccess: () => {
					// Reset semua state form
					setNewStorageNumber("");
					setNewStorageType("mobile");
					setSelectedCustomerCode("");
					setDefaultQuantity("");
				},
			}
		);
	};

	const handleDeleteStorage = (id: number, storageNumber: string) => {
		if (
			window.confirm(
				`Apakah Anda yakin ingin menghapus storage ${storageNumber}?`
			)
		) {
			deleteStorage(id);
		}
	};

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{/* Kolom Formulir */}
			<Card>
				<CardHeader>
					<CardTitle>Tambah Storage Baru</CardTitle>
					<CardDescription>
						Masukkan detail untuk storage baru.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleAddStorage} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="storageNumber">Nomor Storage</Label>
							<Input
								id="storageNumber"
								value={newStorageNumber}
								onChange={(e) =>
									setNewStorageNumber(e.target.value)
								}
								placeholder="Contoh: 1022 atau 5045"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="storageType">Tipe Storage</Label>
							<Select
								value={newStorageType}
								onValueChange={(value: "mobile" | "fixed") =>
									setNewStorageType(value)
								}>
								<SelectTrigger>
									<SelectValue placeholder="Pilih tipe..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="mobile">Mobile</SelectItem>
									<SelectItem value="fixed">Fixed</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Input kondisional untuk tipe 'fixed' */}
						{newStorageType === "fixed" && (
							<>
								<div className="space-y-2">
									<Label htmlFor="customerCode">
										Pelanggan (Pemilik)
									</Label>
									<Select
										value={selectedCustomerCode}
										onValueChange={setSelectedCustomerCode}>
										<SelectTrigger>
											<SelectValue placeholder="Pilih pelanggan..." />
										</SelectTrigger>
										<SelectContent>
											{customers.map((c) => (
												<SelectItem
													key={c.code}
													value={c.code}>
													{c.name || c.code}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="defaultQuantity">
										Jumlah Bawaan
									</Label>
									<Input
										id="defaultQuantity"
										type="number"
										value={defaultQuantity}
										onChange={(e) =>
											setDefaultQuantity(e.target.value)
										}
										placeholder="Contoh: 4"
									/>
								</div>
							</>
						)}

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full">
							{isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : (
								<PlusCircle className="mr-2" />
							)}
							Tambah Storage
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Kolom Tabel */}
			<Card>
				<CardHeader>
					<CardTitle>Daftar Storage</CardTitle>
					<CardDescription>
						Total: {storages.length} storage
					</CardDescription>
				</CardHeader>
				<CardContent className="h-96 overflow-y-auto">
					{isLoading ? (
						<Loader2 className="mx-auto animate-spin" />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nomor</TableHead>
									<TableHead>Tipe</TableHead>
									<TableHead>Pelanggan (Fixed)</TableHead>
									<TableHead>Jumlah</TableHead>
									<TableHead>Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{storages.map((s) => (
									<TableRow key={s.id}>
										<TableCell className="font-bold">
											{s.storage_number}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													s.type === "fixed"
														? "default"
														: "secondary"
												}>
												{s.type}
											</Badge>
										</TableCell>
										<TableCell>
											{s.customer_code || "-"}
										</TableCell>
										<TableCell>
											{s.default_quantity || "-"}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleDeleteStorage(
														s.id,
														s.storage_number
													)
												}>
												<Trash2 className="h-4 w-4 text-red-500" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
