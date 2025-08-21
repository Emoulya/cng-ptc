"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getCustomers,
	addCustomer,
	deleteCustomer,
	updateCustomer,
} from "@/lib/api";
import type { UpdateCustomer } from "@/types/data";
import { toast } from "sonner";

// Hook untuk mendapatkan data customers
export const useCustomers = () => {
	return useQuery({
		queryKey: ["customers"],
		queryFn: getCustomers,
	});
};

// Hook untuk menambah customer baru
export const useAddCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (customer: { code: string; name: string | null }) =>
			addCustomer(customer),
		onSuccess: (_, variables) => {
			toast.success(
				`Pelanggan ${variables.code.toUpperCase()} berhasil ditambahkan`
			);
			queryClient.invalidateQueries({ queryKey: ["customers"] });
		},
		onError: (error: any) => {
			let description = "Terjadi kesalahan yang tidak diketahui.";
			// Cek apakah pesan error mengandung teks untuk duplikat data
			if (
				error.message &&
				error.message.includes(
					"duplicate key value violates unique constraint"
				)
			) {
				description =
					"Kode pelanggan sudah ada. Harap gunakan kode lain.";
			} else if (error.message) {
				description = error.message;
			}
			toast.error("Gagal menambah pelanggan", {
				description: description,
			});
		},
	});
};

// Hook untuk meng-update customer
export const useUpdateCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (customer: UpdateCustomer) => updateCustomer(customer),
		onSuccess: (_, variables) => {
			toast.success(
				`Pelanggan ${variables.code?.toUpperCase()} berhasil diperbarui`
			);
			queryClient.invalidateQueries({ queryKey: ["customers"] });
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
					"Kode pelanggan sudah ada. Harap gunakan kode lain.";
			} else if (error.message) {
				description = error.message;
			}
			toast.error("Gagal memperbarui pelanggan", {
				description: description,
			});
		},
	});
};

// Hook untuk menghapus customer
export const useDeleteCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteCustomer(id),
		onSuccess: () => {
			toast.success("Pelanggan berhasil dihapus");
			queryClient.invalidateQueries({ queryKey: ["customers"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal menghapus pelanggan", {
				description: error.message,
			});
		},
	});
};
