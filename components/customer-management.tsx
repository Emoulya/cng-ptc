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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
	useCustomers,
	useAddCustomer,
	useDeleteCustomer,
	useUpdateCustomer,
} from "@/hooks/use-customers";
import type { Customer } from "@/types/data";

export function CustomerManagement() {
	// Hooks untuk data dan mutasi
	const { data: customers = [], isLoading } = useCustomers();
	const { mutate: addCustomer, isPending: isSubmitting } = useAddCustomer();
	const { mutate: deleteCustomer } = useDeleteCustomer();
	const { mutate: updateCustomer, isPending: isUpdating } =
		useUpdateCustomer();

	// State untuk form tambah
	const [newCustomerCode, setNewCustomerCode] = useState("");
	const [newCustomerName, setNewCustomerName] = useState("");

	// State untuk form edit
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
		null
	);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Handler untuk menambah Customer baru
	const handleAddCustomer = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newCustomerCode) {
			toast.warning("Kode Customer harus diisi");
			return;
		}
		addCustomer(
			{ code: newCustomerCode, name: newCustomerName || null },
			{
				onSuccess: () => {
					setNewCustomerCode("");
					setNewCustomerName("");
				},
			}
		);
	};

	// Handler untuk menghapus Customer
	const handleDeleteCustomer = (id: number) => {
		deleteCustomer(id);
	};

	// Handler untuk memperbarui Customer
	const handleUpdateCustomer = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingCustomer) return;
		// Hanya update nama, karena kode tidak boleh diubah
		updateCustomer(
			{
				id: editingCustomer.id,
				name: editingCustomer.name || null,
				code: editingCustomer.code,
			},
			{
				onSuccess: () => {
					setIsEditDialogOpen(false);
					setEditingCustomer(null);
				},
			}
		);
	};

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{/* Kolom Formulir Tambah */}
			<Card>
				<CardHeader>
					<CardTitle>Tambah Customer Baru</CardTitle>
					<CardDescription>
						Masukkan data untuk Customer baru.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleAddCustomer}
						className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="customerCode">
								Kode Customer (Singkat)
							</Label>
							<Input
								id="customerCode"
								value={newCustomerCode}
								onChange={(e) =>
									setNewCustomerCode(e.target.value)
								}
								placeholder="Contoh: ALM"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="customerName">
								Nama Lengkap Customer (Opsional)
							</Label>
							<Input
								id="customerName"
								value={newCustomerName}
								onChange={(e) =>
									setNewCustomerName(e.target.value)
								}
								placeholder="Contoh: PT Alam Lestari Mandiri"
							/>
						</div>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full">
							{isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : (
								<PlusCircle className="mr-2" />
							)}
							Tambah Customer
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Kolom Tabel */}
			<Card>
				<CardHeader>
					<CardTitle>Daftar Customer</CardTitle>
					<CardDescription>
						Total: {customers.length} Customer
					</CardDescription>
				</CardHeader>
				<CardContent className="h-96 overflow-y-auto">
					{isLoading ? (
						<Loader2 className="mx-auto animate-spin" />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Kode</TableHead>
									<TableHead>Nama</TableHead>
									<TableHead>Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{customers.map((c) => (
									<TableRow key={c.id}>
										<TableCell className="font-bold">
											{c.code}
										</TableCell>
										<TableCell>{c.name || "-"}</TableCell>
										<TableCell className="flex gap-1">
											{/* Tombol Edit */}
											<Dialog
												open={
													isEditDialogOpen &&
													editingCustomer?.id === c.id
												}
												onOpenChange={(open) => {
													setIsEditDialogOpen(open);
													if (!open)
														setEditingCustomer(
															null
														);
												}}>
												<DialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															setEditingCustomer(
																c
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
															Edit Customer:{" "}
															{
																editingCustomer?.code
															}
														</DialogTitle>
													</DialogHeader>
													<form
														onSubmit={
															handleUpdateCustomer
														}
														className="space-y-4 py-4">
														<div className="space-y-2">
															<Label htmlFor="editCustomerCode">
																Kode
															</Label>
															<Input
																id="editCustomerCode"
																value={
																	editingCustomer?.code ||
																	""
																}
																disabled={true} // <-- PERUBAHAN DI SINI
																className="cursor-not-allowed bg-gray-100"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="editCustomerName">
																Nama
															</Label>
															<Input
																id="editCustomerName"
																value={
																	editingCustomer?.name ||
																	""
																}
																onChange={(e) =>
																	setEditingCustomer(
																		(
																			prev
																		) =>
																			prev && {
																				...prev,
																				name: e
																					.target
																					.value,
																			}
																	)
																}
															/>
														</div>
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
															menghapus Customer{" "}
															<span className="font-bold">
																{c.code}
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
																handleDeleteCustomer(
																	c.id
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
