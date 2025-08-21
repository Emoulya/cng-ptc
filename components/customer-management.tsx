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
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
	useCustomers,
	useAddCustomer,
	useDeleteCustomer,
} from "@/hooks/use-customers";
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

export function CustomerManagement() {
	const { data: customers = [], isLoading } = useCustomers();
	const { mutate: addCustomer, isPending: isSubmitting } = useAddCustomer();
	const { mutate: deleteCustomer } = useDeleteCustomer();

	const [newCustomerCode, setNewCustomerCode] = useState("");
	const [newCustomerName, setNewCustomerName] = useState("");

	const handleAddCustomer = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newCustomerCode) {
			toast.warning("Kode Pelanggan harus diisi");
			return;
		}
		addCustomer(
			{ code: newCustomerCode, name: newCustomerName || null },
			{
				onSuccess: () => {
					// Reset form setelah berhasil
					setNewCustomerCode("");
					setNewCustomerName("");
				},
			}
		);
	};

	const handleDeleteCustomer = (id: number) => {
		deleteCustomer(id);
	};

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{/* Kolom Formulir */}
			<Card>
				<CardHeader>
					<CardTitle>Tambah Pelanggan Baru</CardTitle>
					<CardDescription>
						Masukkan data untuk pelanggan baru.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleAddCustomer}
						className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="customerCode">
								Kode Pelanggan (Singkat)
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
								Nama Lengkap Pelanggan (Opsional)
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
							Tambah Pelanggan
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Kolom Tabel */}
			<Card>
				<CardHeader>
					<CardTitle>Daftar Pelanggan</CardTitle>
					<CardDescription>
						Total: {customers.length} pelanggan
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
										<TableCell>
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
															menghapus pelanggan{" "}
															<span className="font-bold">
																{c.code}
															</span>{" "}
															secara permanen.
															Data tidak dapat
															dikembalikan.
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
