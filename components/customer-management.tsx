"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
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

interface Customer {
	id: number;
	code: string;
	name: string | null;
}

export function CustomerManagement() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newCustomerCode, setNewCustomerCode] = useState("");
	const [newCustomerName, setNewCustomerName] = useState("");

	const fetchCustomers = async () => {
		setIsLoading(true);
		const { data, error } = await supabase
			.from("customers")
			.select("*")
			.order("code");
		if (error) {
			toast.error("Gagal memuat daftar pelanggan", {
				description: error.message,
			});
		} else {
			setCustomers(data);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchCustomers();
	}, []);

	const handleAddCustomer = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newCustomerCode) {
			toast.warning("Kode Pelanggan harus diisi");
			return;
		}
		setIsSubmitting(true);
		const { error } = await supabase.from("customers").insert({
			code: newCustomerCode.toUpperCase(),
			name: newCustomerName || null,
		});

		if (error) {
			toast.error("Gagal menambah pelanggan", {
				description: error.message,
			});
		} else {
			toast.success(
				`Pelanggan ${newCustomerCode.toUpperCase()} berhasil ditambahkan`
			);
			setNewCustomerCode("");
			setNewCustomerName("");
			await fetchCustomers(); // Muat ulang data
		}
		setIsSubmitting(false);
	};

	const handleDeleteCustomer = async (id: number, code: string) => {
		if (confirm(`Apakah Anda yakin ingin menghapus pelanggan ${code}?`)) {
			const { error } = await supabase
				.from("customers")
				.delete()
				.match({ id });
			if (error) {
				toast.error("Gagal menghapus pelanggan", {
					description: error.message,
				});
			} else {
				toast.success(`Pelanggan ${code} berhasil dihapus`);
				await fetchCustomers(); // Muat ulang data
			}
		}
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
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleDeleteCustomer(
														c.id,
														c.code
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
