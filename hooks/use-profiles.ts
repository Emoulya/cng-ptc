// cng-ptc/hooks/use-profiles.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfiles, createProfile, deleteProfile } from "@/lib/api";
import type { NewProfileData } from "@/types/data";
import { toast } from "sonner";

// Hook untuk mendapatkan semua data profil
export const useProfiles = () => {
	return useQuery({
		queryKey: ["profiles"],
		queryFn: getProfiles,
	});
};

// Hook untuk membuat profil baru
export const useAddProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newProfile: NewProfileData) => createProfile(newProfile),
		onSuccess: (_, variables) => {
			toast.success("Akun Berhasil Dibuat", {
				description: `Akun untuk ${variables.username} telah ditambahkan.`,
			});
			queryClient.invalidateQueries({ queryKey: ["profiles"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal Membuat Akun", {
				description:
					error.message || "Terjadi kesalahan yang tidak diketahui.",
			});
		},
	});
};

// Hook untuk menghapus profil
export const useDeleteProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteProfile(id),
		onSuccess: () => {
			toast.success("Akun berhasil dihapus.");
			queryClient.invalidateQueries({ queryKey: ["profiles"] });
		},
		onError: (error: Error) => {
			toast.error("Gagal Menghapus Akun", {
				description: error.message,
			});
		},
	});
};
