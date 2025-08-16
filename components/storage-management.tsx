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

interface Storage {
	id: number;
	storage_number: string;
}

export function StorageManagement() {
	const [storages, setStorages] = useState<Storage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newStorageNumber, setNewStorageNumber] = useState("");

	const fetchStorages = async () => {
		setIsLoading(true);
		const { data, error } = await supabase
			.from("storages")
			.select("*")
			.order("storage_number");
		if (error) {
			toast.error("Gagal memuat daftar storage", {
				description: error.message,
			});
		} else {
			setStorages(data);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchStorages();
	}, []);

	const handleAddStorage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newStorageNumber) {
			toast.warning("Nomor Storage harus diisi");
			return;
		}
		setIsSubmitting(true);
		const { error } = await supabase
			.from("storages")
			.insert({ storage_number: newStorageNumber });

		if (error) {
			toast.error("Gagal menambah storage", {
				description: error.message,
			});
		} else {
			toast.success(`Storage ${newStorageNumber} berhasil ditambahkan`);
			setNewStorageNumber("");
			await fetchStorages();
		}
		setIsSubmitting(false);
	};

	const handleDeleteStorage = async (id: number, storageNumber: string) => {
		if (
			confirm(
				`Apakah Anda yakin ingin menghapus storage ${storageNumber}?`
			)
		) {
			const { error } = await supabase
				.from("storages")
				.delete()
				.match({ id });
			if (error) {
				toast.error("Gagal menghapus storage", {
					description: error.message,
				});
			} else {
				toast.success(`Storage ${storageNumber} berhasil dihapus`);
				await fetchStorages();
			}
		}
	};

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{/* Kolom Formulir */}
			<Card>
				<CardHeader>
					<CardTitle>Tambah Storage Baru</CardTitle>
					<CardDescription>
						Masukkan nomor atau kode unik untuk storage baru.
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
								placeholder="Contoh: 1022 atau EK05"
								required
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
									<TableHead>Nomor Storage</TableHead>
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
