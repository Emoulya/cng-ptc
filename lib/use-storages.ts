"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStorages, addStorage, deleteStorage } from "@/lib/api";
import { toast } from "sonner";

// Hook untuk mendapatkan data storages
export const useStorages = () => {
	return useQuery({
		queryKey: ["storages"],
		queryFn: getStorages,
	});
};

// Hook untuk menambah storage baru
export const useAddStorage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (storageNumber: string) => addStorage(storageNumber),
		onSuccess: (_, variables) => {
			toast.success(`Storage ${variables} berhasil ditambahkan`);
			queryClient.invalidateQueries({ queryKey: ["storages"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal menambah storage", {
				description: error.message,
			});
		},
	});
};

// Hook untuk menghapus storage
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
