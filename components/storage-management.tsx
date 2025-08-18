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
	useStorages,
	useAddStorage,
	useDeleteStorage,
} from "@/hooks/use-storages";

export function StorageManagement() {
	const { data: storages = [], isLoading } = useStorages();
	const { mutate: addStorage, isPending: isSubmitting } = useAddStorage();
	const { mutate: deleteStorage } = useDeleteStorage();

	const [newStorageNumber, setNewStorageNumber] = useState("");

	const handleAddStorage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newStorageNumber) {
			toast.warning("Nomor Storage harus diisi");
			return;
		}
		addStorage(newStorageNumber, {
			onSuccess: () => {
				setNewStorageNumber(""); // Reset form setelah berhasil
			},
		});
	};

	const handleDeleteStorage = (id: number, storageNumber: string) => {
		if (
			confirm(
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
