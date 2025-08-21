"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAllReadings,
	addReading,
	deleteReading,
	getReadingsByCustomer,
	updateReading,
} from "@/lib/api";
import type { ReadingFilters } from "@/lib/api";
import { toast } from "sonner";
import type { NewReading, UpdateReading } from "@/types/data";

// Hook untuk mendapatkan SEMUA data readings
export const useAllReadings = (filters: ReadingFilters) => {
	return useQuery({
		queryKey: ["readings", filters],
		queryFn: () => getAllReadings(filters),
	});
};

// Hook untuk mendapatkan data readings berdasarkan customer
export const useReadingsByCustomer = (customerCode: string) => {
	return useQuery({
		queryKey: ["readings", customerCode],
		queryFn: () => getReadingsByCustomer(customerCode),
		enabled: !!customerCode,
	});
};

// Hook untuk MENAMBAH data reading baru
export const useAddReading = (options?: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newReading: NewReading) => addReading(newReading),
		onSuccess: (_, variables) => {
			const hour = new Date(variables.created_at)
				.getHours()
				.toString()
				.padStart(2, "0");
			toast.success("Data Tersimpan", {
				description: `Data untuk jam ${hour}:00 berhasil dicatat.`,
			});
			// Invalidate queries agar data di UI otomatis ter-update
			queryClient.invalidateQueries({ queryKey: ["readings"] });

			options?.onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error("Gagal Menyimpan Data", {
				description: error.message || "Terjadi kesalahan. Coba lagi.",
			});
		},
	});
};

// Hook untuk MENGUPDATE satu data reading
export const useUpdateReading = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (reading: UpdateReading) => updateReading(reading),
		onSuccess: () => {
			toast.success("Data berhasil diperbarui");
			queryClient.invalidateQueries({ queryKey: ["readings"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal memperbarui data", {
				description: error.message,
			});
		},
	});
};

// Hook untuk MENGHAPUS satu data reading
export const useDeleteReading = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteReading(id),
		onSuccess: () => {
			// Tidak perlu toast di sini karena akan di-handle di BulkOperations
			queryClient.invalidateQueries({ queryKey: ["readings"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal Menghapus Data", { description: error.message });
		},
	});
};
