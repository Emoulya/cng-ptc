import { z } from "zod";

// Skema untuk `coerce` (mengubah string dari input) menjadi angka.
const stringToNumber = z.string().transform((val) => Number(val)).refine((val) => val >= 0, {
	message: "Nilai tidak boleh negatif",
});

// Skema untuk Data Entry Form
export const dataEntrySchema = z.object({
	recordingTime: z.string().min(1, "Jam pencatatan harus diisi"),
	storageNumber: z.string().min(1, "Nomor storage harus dipilih"),
	fixedStorageQuantity: stringToNumber.pipe(z.number().min(
		1,
		"Jumlah storage harus diisi"
	)),
	psi: stringToNumber.pipe(z.number().min(0, "PSI tidak boleh negatif")),
	temp: stringToNumber, // Temperatur bisa negatif
	psiOut: stringToNumber.pipe(z.number().min(0, "P. Out tidak boleh negatif")),
	flowTurbine: stringToNumber.pipe(z.number().min(0, "Flow/Turbin tidak boleh negatif")),
	remarks: z.string().optional(),
});

// Tipe TypeScript yang diekstrak dari skema
export type TDataEntrySchema = z.infer<typeof dataEntrySchema>;

// Skema untuk Stop Form
export const stopFormSchema = z.object({
	recordingTime: z.string().min(1, "Jam pencatatan harus diisi"),
	psi: stringToNumber.pipe(z.number().min(0, "PSI tidak boleh negatif")),
	temp: stringToNumber,
	psiOut: stringToNumber.pipe(z.number().min(0, "P. Out tidak boleh negatif")),
	flowTurbine: stringToNumber.pipe(z.number().min(0, "Flow/Turbin tidak boleh negatif")),
	remarks: z.string().optional(),
});

export type TStopFormSchema = z.infer<typeof stopFormSchema>;

// Skema untuk Dumping Form
export const dumpingFormSchema = z.object({
	source_storage_number: z.string().min(1, "Storage sumber harus dipilih"),
	destination_storage_number: z
		.string()
		.min(1, "Storage tujuan harus dipilih"),
	source_psi_before: stringToNumber.pipe(z.number().min(0, "Nilai tidak boleh negatif")),
	source_psi_after: stringToNumber.pipe(z.number().min(0, "Nilai tidak boleh negatif")),
	destination_psi_after: stringToNumber.pipe(z.number().min(0, "Nilai tidak boleh negatif")),
	source_temp_before: stringToNumber,
	source_temp_after: stringToNumber,
	destination_temp: stringToNumber,
	flow_turbine_before: stringToNumber.pipe(z.number().min(0, "Nilai tidak boleh negatif")),
	flow_turbine_after: stringToNumber.pipe(z.number().min(0, "Nilai tidak boleh negatif")),
	psi_out: stringToNumber.pipe(z.number().min(0, "Nilai tidak boleh negatif")),
	time_before: z.string().min(1, "Waktu mulai harus diisi"),
	time_after: z.string().min(1, "Waktu selesai harus diisi"),
}).refine((data) => data.source_storage_number !== data.destination_storage_number, {
	message: "Storage sumber dan tujuan tidak boleh sama",
	path: ["destination_storage_number"],
});

export type TDumpingFormSchema = z.infer<typeof dumpingFormSchema>;