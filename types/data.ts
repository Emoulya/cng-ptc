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

// Tipe data untuk UPDATE reading
export interface UpdateReading {
	id: number;
	storage_number?: string;
	fixed_storage_quantity?: number;
	recorded_at?: string;
	psi?: number;
	temp?: number;
	psi_out?: number;
	flow_turbine?: number;
}

// Tipe data setelah flow_meter dihitung di client
export interface ReadingWithFlowMeter extends ReadingFromDB {
	flowMeter: number | string;
	is_editable: boolean;
}

// Tipe data untuk baris "CHANGE"
export interface ChangeSummaryRow {
	id: string;
	isChangeRow: true;
	totalFlow: number;
	duration: string;
	customer_code: string;
	recorded_at: string;
}

// Tipe gabungan untuk tabel
export type TableRowData = ReadingWithFlowMeter | ChangeSummaryRow;

export interface UserProfile {
	id: string;
	username: string;
	role: "operator" | "admin" | "super_admin";
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

export interface Customer {
	id: number;
	code: string;
	name: string | null;
}

// --- Tipe untuk UPDATE Customer ---
export interface UpdateCustomer extends Partial<Omit<Customer, "id">> {
	id: number;
}
