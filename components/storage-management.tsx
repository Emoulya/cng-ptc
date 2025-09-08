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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
	useStorages,
	useAddStorage,
	useDeleteStorage,
	useUpdateStorage,
} from "@/hooks/use-storages";
import { useCustomers } from "@/hooks/use-customers";
import type { Storage } from "@/types/data";

export function StorageManagement() {
	// Hooks untuk data dan mutasi
	const { data: storages = [], isLoading } = useStorages();
	const { data: customers = [] } = useCustomers();
	const { mutate: addStorage, isPending: isSubmitting } = useAddStorage();
	const { mutate: deleteStorage } = useDeleteStorage();
	const { mutate: updateStorage, isPending: isUpdating } = useUpdateStorage();

	// State untuk form tambah
	const [newStorageNumber, setNewStorageNumber] = useState("");
	const [newStorageType, setNewStorageType] = useState<"mobile" | "fixed">(
		"mobile"
	);
	const [selectedCustomerCode, setSelectedCustomerCode] = useState("");
	const [defaultQuantity, setDefaultQuantity] = useState("");

	// State untuk form edit
	const [editingStorage, setEditingStorage] = useState<Storage | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Handler untuk menambah storage baru
	const handleAddStorage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newStorageNumber) {
			toast.warning("Nomor Storage harus diisi");
			return;
		}
		if (
			newStorageType === "fixed" &&
			(!selectedCustomerCode || !defaultQuantity)
		) {
			toast.warning(
				"Untuk storage 'fixed', Customer dan Jumlah Bawaan harus diisi."
			);
			return;
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
					setNewStorageNumber("");
					setNewStorageType("mobile");
					setSelectedCustomerCode("");
					setDefaultQuantity("");
				},
			}
		);
	};

	// Handler untuk menghapus storage
	const handleDeleteStorage = (id: number) => {
		deleteStorage(id);
	};

	// Handler untuk memperbarui storage
	const handleUpdateStorage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingStorage) return;

		if (
			editingStorage.type === "fixed" &&
			(!editingStorage.customer_code || !editingStorage.default_quantity)
		) {
			toast.warning(
				"Untuk storage 'fixed', Customer dan Jumlah Bawaan harus diisi."
			);
			return;
		}

		updateStorage(
			{
				id: editingStorage.id,
				storage_number: editingStorage.storage_number,
				type: editingStorage.type,
				customer_code:
					editingStorage.type === "fixed"
						? editingStorage.customer_code
						: null,
				default_quantity:
					editingStorage.type === "fixed"
						? Number(editingStorage.default_quantity)
						: null,
			},
			{
				onSuccess: () => {
					setIsEditDialogOpen(false);
					setEditingStorage(null);
				},
			}
		);
	};

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{/* Kolom Formulir Tambah */}
			<Card>
				<CardHeader>
					<CardTitle>Tambah Storage Baru</CardTitle>
					<CardDescription>
						Masukkan detail untuk storage baru.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleAddStorage}
						className="space-y-4">
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
									<SelectItem value="mobile">
										Mobile
									</SelectItem>
									<SelectItem value="fixed">Fixed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{newStorageType === "fixed" && (
							<>
								<div className="space-y-2">
									<Label htmlFor="customerCode">
										Customer (Pemilik)
									</Label>
									<Select
										value={selectedCustomerCode}
										onValueChange={setSelectedCustomerCode}>
										<SelectTrigger>
											<SelectValue placeholder="Pilih Customer..." />
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
									<TableHead>Customer</TableHead>
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
										<TableCell className="flex gap-1">
											{/* Tombol Edit */}
											<Dialog
												open={
													isEditDialogOpen &&
													editingStorage?.id === s.id
												}
												onOpenChange={(open) => {
													setIsEditDialogOpen(open);
													if (!open)
														setEditingStorage(null);
												}}>
												<DialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															setEditingStorage(
																s
															);
															setIsEditDialogOpen(
																true
															);
														}}>
														<Pencil className="h-4 w-4 text-blue-500" />
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>
															Edit Storage:{" "}
															{
																editingStorage?.storage_number
															}
														</DialogTitle>
													</DialogHeader>
													<form
														onSubmit={
															handleUpdateStorage
														}
														className="space-y-4 py-4">
														{editingStorage && (
															<>
																<div className="space-y-2">
																	<Label htmlFor="editStorageNumber">
																		Nomor
																	</Label>
																	<Input
																		id="editStorageNumber"
																		value={
																			editingStorage.storage_number
																		}
																		onChange={(
																			e
																		) =>
																			setEditingStorage(
																				{
																					...editingStorage,
																					storage_number:
																						e
																							.target
																							.value,
																				}
																			)
																		}
																	/>
																</div>
																<div className="space-y-2">
																	<Label htmlFor="editStorageType">
																		Tipe
																	</Label>
																	<Select
																		value={
																			editingStorage.type
																		}
																		onValueChange={(
																			value:
																				| "mobile"
																				| "fixed"
																		) =>
																			setEditingStorage(
																				{
																					...editingStorage,
																					type: value,
																				}
																			)
																		}>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="mobile">
																				Mobile
																			</SelectItem>
																			<SelectItem value="fixed">
																				Fixed
																			</SelectItem>
																		</SelectContent>
																	</Select>
																</div>
																{editingStorage.type ===
																	"fixed" && (
																	<>
																		<div className="space-y-2">
																			<Label htmlFor="editCustomerCode">
																				Customer
																			</Label>
																			<Select
																				value={
																					editingStorage.customer_code ||
																					""
																				}
																				onValueChange={(
																					value
																				) =>
																					setEditingStorage(
																						{
																							...editingStorage,
																							customer_code:
																								value,
																						}
																					)
																				}>
																				<SelectTrigger>
																					<SelectValue placeholder="Pilih..." />
																				</SelectTrigger>
																				<SelectContent>
																					{customers.map(
																						(
																							c
																						) => (
																							<SelectItem
																								key={
																									c.code
																								}
																								value={
																									c.code
																								}>
																								{c.name ||
																									c.code}
																							</SelectItem>
																						)
																					)}
																				</SelectContent>
																			</Select>
																		</div>
																		<div className="space-y-2">
																			<Label htmlFor="editDefaultQuantity">
																				Jumlah
																			</Label>
																			<Input
																				id="editDefaultQuantity"
																				type="number"
																				value={
																					editingStorage.default_quantity ||
																					""
																				}
																				onChange={(
																					e
																				) =>
																					setEditingStorage(
																						{
																							...editingStorage,
																							default_quantity:
																								parseInt(
																									e
																										.target
																										.value
																								),
																						}
																					)
																				}
																			/>
																		</div>
																	</>
																)}
															</>
														)}
														<DialogFooter>
															<DialogClose
																asChild>
																<Button
																	type="button"
																	variant="secondary">
																	Batal
																</Button>
															</DialogClose>
															<Button
																type="submit"
																disabled={
																	isUpdating
																}>
																{isUpdating && (
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																)}
																Simpan Perubahan
															</Button>
														</DialogFooter>
													</form>
												</DialogContent>
											</Dialog>

											{/* Tombol Hapus */}
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm">
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Apakah Anda yakin?
														</AlertDialogTitle>
														<AlertDialogDescription>
															Tindakan ini akan
															menghapus storage{" "}
															<span className="font-bold">
																{
																	s.storage_number
																}
															</span>{" "}
															secara permanen.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															Batal
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() =>
																handleDeleteStorage(
																	s.id
																)
															}>
															Ya, Hapus
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
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
