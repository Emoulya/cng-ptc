// hooks/use-readings.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAllReadings,
	addReading,
	deleteReading,
	getReadingsByCustomer,
	updateReading,
	addDumpingReading,
	getProcessedReadingsByCustomer,
    addStopReading,
} from "@/lib/api";
import type { ReadingFilters } from "@/lib/api";
import { toast } from "sonner";
import type {
	NewReading,
	UpdateReading,
	NewDumpingData,
	TableRowData,
    NewStopReading,
} from "@/types/data";

// Hook untuk mendapatkan data yang sudah diproses dari backend
export const useProcessedReadingsByCustomer = (
    customerCode: string,
    timeRange: 'day' | 'week' | 'month' | 'all'
) => {
	return useQuery<TableRowData[]>({
		queryKey: ["processed-readings", customerCode, timeRange],
		queryFn: () => getProcessedReadingsByCustomer(customerCode, timeRange),
		enabled: !!customerCode,
	});
};

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
			const hour = new Date(variables.recorded_at)
				.getHours()
				.toString()
				.padStart(2, "0");
			toast.success("Data Tersimpan", {
				description: `Data untuk jam ${hour}:00 berhasil dicatat.`,
			});
			// Invalidate query yang benar agar tabel di UI otomatis ter-update
			queryClient.invalidateQueries({
				queryKey: ["processed-readings", variables.customer_code],
			});
			// Juga invalidate query data mentah untuk bagian lain dari aplikasi (misal: admin)
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

// Hook untuk MENAMBAH data STOP baru
export const useAddStopReading = (options?: { onSuccess?: () => void }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (stopReading: NewStopReading) => addStopReading(stopReading),
        onSuccess: (_, variables) => {
            toast.success("Data STOP Tersimpan", {
                description: `Sesi laporan untuk ${variables.storage_number} telah dihentikan.`,
            });
            queryClient.invalidateQueries({
                queryKey: ["processed-readings", variables.customer_code],
            });
            queryClient.invalidateQueries({ queryKey: ["readings"] });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            toast.error("Gagal Menyimpan Data STOP", {
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
		onSuccess: (_, variables) => {
			toast.success("Data berhasil diperbarui");
			queryClient.invalidateQueries({ queryKey: ["readings"] });
			queryClient.invalidateQueries({ queryKey: ["processed-readings", variables.customer_code] });
		},
		onError: (error: Error) => {
			toast.error("Gagal memperbarui data", {
				description: error.message,
			});
		},
	});
};

// Hook untuk MENGHAPUS satu data reading berdasarkan ID
export const useDeleteReading = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteReading(id),
		onSuccess: () => {
			toast.success("Data berhasil dihapus"); // Tambahkan notifikasi sukses
			queryClient.invalidateQueries({ queryKey: ["readings"] });
			queryClient.invalidateQueries({ queryKey: ["processed-readings"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal Menghapus Data", { description: error.message });
		},
	});
};

// Hook untuk MENAMBAH data DUMPING baru
export const useAddDumping = (options?: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dumpingData: NewDumpingData) =>
			addDumpingReading(dumpingData),
		onSuccess: (_, variables) => {
			toast.success("Operasi Dumping Berhasil", {
				description: `Data dumping telah berhasil dicatat.`,
			});
			// Invalidate query yang benar agar tabel di UI otomatis ter-update
			queryClient.invalidateQueries({
				queryKey: ["processed-readings", variables.customer_code],
			});
			// Juga invalidate query data mentah untuk bagian lain dari aplikasi (misal: admin)
			queryClient.invalidateQueries({ queryKey: ["readings"] });

			options?.onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error("Gagal Mencatat Dumping", {
				description: error.message || "Terjadi kesalahan. Coba lagi.",
			});
		},
	});
};
