// cng-ptc/types/data.ts

// Tipe data dari database Supabase
export interface ReadingFromDB {
	id: number;
	created_at: string;
	recorded_at: string;
	customer_code: string;
	storage_number: string;
	fixed_storage_quantity: number;
	psi: number;
	temp: number;
	psi_out: number;
	flow_turbine: number;
	remarks: string | null;
	operation_type: "manual" | "dumping" | "stop";
	profiles: {
		username: string;
	} | null;
}

// Tipe data saat mengirim data BARU
export interface NewReading {
	recorded_at: string;
	customer_code: string;
	storage_number: string;
	operator_id: string;
	fixed_storage_quantity: number;
	psi: number;
	temp: number;
	psi_out: number;
	flow_turbine: number;
	remarks: string;
}

// Tipe data saat menambah pembacaan pada stop
export interface NewStopReading {
    customer_code: string;
    storage_number: string;
    manual_created_at: string;
    psi: number;
    flow_turbine: number;
    remarks?: string;
}

// Payload yang dikirim ke backend (tanpa id)
export interface UpdateReadingPayload {
	psi?: number;
	temp?: number;
	psi_out?: number;
	flow_turbine?: number;
	remarks?: string;
	fixed_storage_quantity?: number;
	recorded_at?: string;
	storage_number?: string;
}

// Parameter untuk fungsi update (butuh id di URL)
export interface UpdateReading extends UpdateReadingPayload {
	id: number;
}

// Tipe data setelah flow_meter dihitung di client
export interface ReadingWithFlowMeter extends ReadingFromDB {
	is_deletable: any;
	flowMeter: number | string;
	is_editable: boolean;
}

// Tipe data untuk baris "CHANGE" (Kuning)
export interface ChangeSummaryRow {
	id: string;
	isChangeRow: true; // Properti ini khusus untuk baris kuning
	totalFlow: number;
	duration: string; // Di sini digunakan untuk menyimpan `endTime`
	customer_code: string;
	recorded_at: string;
}

// Tipe data untuk baris "STOP" (Merah)
export interface StopSummaryRow {
    id: string;
    isStopRow: true;
    totalFlow: number;
    duration: string;
    customer_code: string;
    recorded_at: string;
}

// --- TIPE BARU UNTUK TOTAL DUMPING (BIRU) ---
export interface DumpingTotalRow {
	id: string;
	isDumpingTotalRow: true; // Penanda baru khusus untuk baris TOTAL biru
	storage_number: string;
	totalFlow: number;
	duration: string; // Di sini digunakan untuk menyimpan `endTime`
	customer_code: string;
	recorded_at: string;
}

// --- TIPE BARU UNTUK DURASI DUMPING (BIRU) ---
export interface DumpingSummaryRow {
	id: string;
	isDumpingSummary: true; // Penanda untuk baris durasi dumping
	totalFlow: number;
	duration: string; // Di sini untuk menyimpan durasi total (MM:SS)
	customer_code: string;
	recorded_at: string;
}

// Tipe gabungan untuk tabel, sekarang mencakup semua jenis baris
export type TableRowData =
	| ReadingWithFlowMeter
	| ChangeSummaryRow
	| StopSummaryRow
	| DumpingTotalRow
	| DumpingSummaryRow;

export interface UserProfile {
	id: string;
	username: string;
	role: "operator" | "admin" | "super_admin";
	email?: string;
}

export interface NewProfileData {
	username: string;
	email: string;
	password: string;
	role: "operator" | "admin";
}

export interface Customer {
	id: number;
	code: string;
	name: string | null;
}

// --- Tipe Storage Diperbarui ---
export interface Storage {
	id: number;
	storage_number: string;
	type: "mobile" | "fixed";
	customer_code: string | null;
	default_quantity: number | null;
}

// --- Tipe untuk Storage BARU ---
export interface NewStorage {
	storage_number: string;
	type: "mobile" | "fixed";
	customer_code?: string | null;
	default_quantity?: number | null;
}

// --- Tipe untuk UPDATE Storage ---
export interface UpdateStorage extends Partial<NewStorage> {
	id: number;
}

// --- Tipe untuk UPDATE Customer ---
export interface UpdateCustomer extends Partial<Omit<Customer, "id">> {
	id: number;
}

export interface NewDumpingData {
	customer_code: string;
	operator_id: string;
	source_storage_number: string;
	destination_storage_number: string;
	source_psi_before: number;
	source_psi_after: number;
	source_temp_before: number;
	source_temp_after: number;
	destination_psi_after: number;
	destination_temp: number;
	flow_turbine_before: number;
	flow_turbine_after: number;
	psi_out: number;
	time_before: string; // Format "HH:mm"
	time_after: string; // Format "HH:mm"
}

export interface AnalyticsData {
	totalReadings: number;
	avgPSI: number;
	avgTemp: number;
	avgFlow: number;
	topCustomers: { customer: string; readings: number }[];
}

export interface TimeSeriesData {
	date: string;
	average_psi: number;
	reading_count: number;
}
