import { supabase } from "@/lib/supabase-client";
import type {
	NewReading,
	ReadingWithFlowMeter,
	Customer,
	Storage,
	NewStorage,
} from "@/types/data";

// === API Functions for Readings ===

export const getAllReadings = async (): Promise<ReadingWithFlowMeter[]> => {
	const { data, error } = await supabase.rpc("get_readings_with_flowmeter", {
		customer_code_param: "all",
	});
	if (error) throw error;
	return data as ReadingWithFlowMeter[];
};

export const getReadingsByCustomer = async (
	customerCode: string
): Promise<ReadingWithFlowMeter[]> => {
	if (!customerCode) return [];
	const { data, error } = await supabase.rpc("get_readings_with_flowmeter", {
		customer_code_param: customerCode,
	});
	if (error) throw error;
	return data as ReadingWithFlowMeter[];
};

export const addReading = async (reading: NewReading): Promise<void> => {
	// Panggil fungsi RPC 'add_reading_with_backfill'
	const { error } = await supabase.rpc("add_reading_with_backfill", {
		p_created_at: reading.created_at,
		p_customer_code: reading.customer_code,
		p_operator_id: reading.operator_id,
		p_storage_number: reading.storage_number,
		p_fixed_storage_quantity: reading.fixed_storage_quantity,
		p_psi: reading.psi,
		p_temp: reading.temp,
		p_psi_out: reading.psi_out,
		p_flow_turbine: reading.flow_turbine,
		p_remarks: reading.remarks,
	});

	if (error) {
		console.error("RPC Error:", error);
		throw error;
	}
};

export const deleteReading = async (id: number): Promise<void> => {
	const { error } = await supabase.from("readings").delete().match({ id });
	if (error) throw error;
};

// === API Functions for Customers ===

export const getCustomers = async (): Promise<Customer[]> => {
	const { data, error } = await supabase
		.from("customers")
		.select("id, code, name")
		.order("code", { ascending: true });
	if (error) throw error;
	return data;
};

export const addCustomer = async (customer: {
	code: string;
	name: string | null;
}): Promise<void> => {
	const { error } = await supabase.from("customers").insert({
		code: customer.code.toUpperCase(),
		name: customer.name || null,
	});
	if (error) throw error;
};

export const deleteCustomer = async (id: number): Promise<void> => {
	const { error } = await supabase.from("customers").delete().match({ id });
	if (error) throw error;
};

// === API Functions for Storages ===

// Mengambil SEMUA storage (untuk Admin)
export const getStorages = async (): Promise<Storage[]> => {
	const { data, error } = await supabase
		.from("storages")
		.select("id, storage_number, type, customer_code, default_quantity")
		.order("storage_number", { ascending: true });
	if (error) throw error;
	return data;
};

// Mengambil storage yang relevan untuk operator
export const getStoragesForOperator = async (
	customerCode: string
): Promise<Storage[]> => {
	if (!customerCode) return [];
	const { data, error } = await supabase.rpc("get_relevant_storages", {
		customer_code_param: customerCode,
	});
	if (error) throw error;
	return data as Storage[];
};

export const addStorage = async (storage: NewStorage): Promise<void> => {
	const { error } = await supabase.from("storages").insert({
		storage_number: storage.storage_number,
		type: storage.type,
		customer_code: storage.type === "fixed" ? storage.customer_code : null,
		default_quantity:
			storage.type === "fixed" ? storage.default_quantity : null,
	});
	if (error) throw error;
};

export const deleteStorage = async (id: number): Promise<void> => {
	const { error } = await supabase.from("storages").delete().match({ id });
	if (error) throw error;
};
