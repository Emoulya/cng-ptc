"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getStorages,
	addStorage,
	deleteStorage,
	getStoragesForOperator,
	updateStorage,
} from "@/lib/api";
import type { NewStorage, UpdateStorage } from "@/types/data";
import { toast } from "sonner";

// Hook untuk mendapatkan SEMUA data storages (untuk Admin)
export const useStorages = () => {
	return useQuery({
		queryKey: ["storages"],
		queryFn: getStorages,
	});
};

// Hook untuk mendapatkan storage yang relevan berdasarkan customer
export const useStoragesForOperator = (customerCode: string) => {
	return useQuery({
		queryKey: ["storages", "operator", customerCode],
		queryFn: () => getStoragesForOperator(customerCode),
		enabled: !!customerCode,
	});
};

// Hook untuk menambah storage baru (untuk Admin)
export const useAddStorage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (storage: NewStorage) => addStorage(storage),
		onSuccess: (_, variables) => {
			toast.success(
				`Storage ${variables.storage_number} berhasil ditambahkan`
			);
			queryClient.invalidateQueries({ queryKey: ["storages"] });
		},
		onError: (error: any) => {
			let description = "Terjadi kesalahan yang tidak diketahui.";
			if (
				error.message &&
				error.message.includes(
					"duplicate key value violates unique constraint"
				)
			) {
				description =
					"Nomor storage sudah ada. Harap gunakan nomor lain.";
			} else if (error.message) {
				description = error.message;
			}
			toast.error("Gagal menambah storage", {
				description: description,
			});
		},
	});
};

// Hook untuk meng-update storage (untuk Admin)
export const useUpdateStorage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (storage: UpdateStorage) => updateStorage(storage),
		onSuccess: (_, variables) => {
			toast.success(
				`Storage ${variables.storage_number} berhasil diperbarui`
			);
			queryClient.invalidateQueries({ queryKey: ["storages"] });
		},
		onError: (error: any) => {
			let description = "Terjadi kesalahan yang tidak diketahui.";
			if (
				error.message &&
				error.message.includes(
					"duplicate key value violates unique constraint"
				)
			) {
				description =
					"Nomor storage sudah ada. Harap gunakan nomor lain.";
			} else if (error.message) {
				description = error.message;
			}
			toast.error("Gagal memperbarui storage", {
				description: description,
			});
		},
	});
};

// Hook untuk menghapus storage (untuk Admin)
export const useDeleteStorage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteStorage(id),
		onSuccess: () => {
			toast.success("Storage berhasil dihapus");
			queryClient.invalidateQueries({ queryKey: ["storages"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal menghapus storage", {
				description: error.message,
			});
		},
	});
};
