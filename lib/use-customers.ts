"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, addCustomer, deleteCustomer } from "@/lib/api";
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
		onError: (error: Error) => {
			toast.error("Gagal menambah pelanggan", {
				description: error.message,
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
