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

// Tipe untuk PAYLOAD FORM STOP
export interface NewStopReading {
	customer_code: string;
	storage_number: string;
	manual_created_at: string;
	psi: number;
	temp: number;
	psi_out: number;
	flow_turbine: number;
	remarks?: string;
}

// Payload yang dikirim ke backend untuk update (tanpa id)
export interface UpdateReadingPayload {
	psi?: number;
	temp?: number;
	psi_out?: number;
	flow_turbine?: number;
	remarks?: string;
	fixed_storage_quantity?: number;
	recorded_at?: string;
	storage_number?: string;
	customer_code?: string;
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
	isChangeRow: true;
	totalFlow: number;
	duration: string;
	customer_code: string;
	recorded_at: string;
}

// Tipe untuk BARIS STOP (MERAH)
export interface StopSummaryRow {
	id: string;
	isStopRow: true;
	totalFlow: number;
	duration: string;
	customer_code: string;
	recorded_at: string;
}

// Tipe untuk TOTAL DUMPING (BIRU)
export interface DumpingTotalRow {
	id: string;
	isDumpingTotalRow: true;
	storage_number: string;
	totalFlow: number;
	duration: string;
	customer_code: string;
	recorded_at: string;
}

// Tipe untuk DURASI DUMPING (BIRU)
export interface DumpingSummaryRow {
	id: string;
	isDumpingSummary: true;
	totalFlow: number;
	duration: string;
	customer_code: string;
	recorded_at: string;
}

// Tipe gabungan untuk tabel
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

// --- Tipe Storage  ---
export interface Storage {
	id: number;
	storage_number: string;
	type: "mobile" | "fixed";
	customer_code: string | null;
	default_quantity: number | null;
}

// --- Tipe untuk Storage  ---
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
	time_before: string;
	time_after: string;
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
