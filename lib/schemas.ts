import { z } from "zod";

// Skema untuk angka umum (Pressure, Flow, dll)
// Wajib diisi, Harus angka, ngak boleh negatif
const requiredNumber = z
	.string()
	.trim() // Hapus spasi di awal/akhir
	.min(1, { message: "Wajib diisi" })
	.transform((val) => Number(val))
	.refine((val) => !isNaN(val), { message: "Harus berupa angka valid" })
	.refine((val) => val >= 0, { message: "Nilai tidak boleh negatif" });

// Skema  Data Entry Form
export const dataEntrySchema = z.object({
	recordingTime: z.string().min(1, "Jam pencatatan harus diisi"),
	storageNumber: z.string().min(1, "Nomor storage harus dipilih"),

	fixedStorageQuantity: requiredNumber.pipe(
		z.number().min(1, "Jumlah storage minimal 1")
	),

	psi: requiredNumber,
	temp: requiredNumber,
	psiOut: requiredNumber,
	flowTurbine: requiredNumber,

	remarks: z.string().optional(),
});

// Tipe TypeScript yang diekstrak dari skema
export type TDataEntrySchema = z.infer<typeof dataEntrySchema>;

// Skema untuk Stop Form
export const stopFormSchema = z.object({
	recordingTime: z.string().min(1, "Jam pencatatan harus diisi"),
	psi: requiredNumber,
	temp: requiredNumber,
	psiOut: requiredNumber,
	flowTurbine: requiredNumber,
	remarks: z.string().optional(),
});

export type TStopFormSchema = z.infer<typeof stopFormSchema>;

// Skema untuk Dumping Form
export const dumpingFormSchema = z
	.object({
		source_storage_number: z
			.string()
			.min(1, "Storage sumber harus dipilih"),
		destination_storage_number: z
			.string()
			.min(1, "Storage tujuan harus dipilih"),

		source_psi_before: requiredNumber,
		source_psi_after: requiredNumber,
		destination_psi_after: requiredNumber,

		source_temp_before: requiredNumber,
		source_temp_after: requiredNumber,
		destination_temp: requiredNumber,

		flow_turbine_before: requiredNumber,
		flow_turbine_after: requiredNumber,
		psi_out: requiredNumber,

		time_before: z.string().min(1, "Waktu mulai harus diisi"),
		time_after: z.string().min(1, "Waktu selesai harus diisi"),
	})
	.refine(
		(data) =>
			data.source_storage_number !== data.destination_storage_number,
		{
			message: "Storage sumber dan tujuan tidak boleh sama",
			path: ["destination_storage_number"], // Tampilkan error di field tujuan
		}
	);

export type TDumpingFormSchema = z.infer<typeof dumpingFormSchema>;
