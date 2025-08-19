// Tipe data dari database Supabase
export interface ReadingFromDB {
	id: number;
	created_at: string;
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
	created_at: string;
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

// Tipe data setelah flow_meter dihitung di client
export interface ReadingWithFlowMeter extends ReadingFromDB {
	flowMeter: number | string;
}

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
