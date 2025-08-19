import { supabase } from "@/lib/supabase-client";
import type {
	NewReading,
	ReadingWithFlowMeter,
	Customer,
	Storage,
} from "@/types/data";


// === API Functions for Readings ===

export const getAllReadings = async (): Promise<ReadingWithFlowMeter[]> => {
	// Panggil fungsi RPC dengan parameter 'all'
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
	// Panggil fungsi RPC dengan customerCode yang spesifik
	const { data, error } = await supabase.rpc("get_readings_with_flowmeter", {
		customer_code_param: customerCode,
	});

	if (error) throw error;
	return data as ReadingWithFlowMeter[];
};

export const addReading = async (reading: NewReading): Promise<void> => {
	const { error } = await supabase.from("readings").insert(reading);
	if (error) throw error;
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

export const getStorages = async (): Promise<Storage[]> => {
	const { data, error } = await supabase
		.from("storages")
		.select("id, storage_number")
		.order("storage_number", { ascending: true });
	if (error) throw error;
	return data;
};

export const addStorage = async (storageNumber: string): Promise<void> => {
	const { error } = await supabase
		.from("storages")
		.insert({ storage_number: storageNumber });
	if (error) throw error;
};

export const deleteStorage = async (id: number): Promise<void> => {
	const { error } = await supabase.from("storages").delete().match({ id });
	if (error) throw error;
};
