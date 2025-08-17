import { supabase } from "@/lib/supabase-client";
import type {
	NewReading,
	ReadingFromDB,
	ReadingWithFlowMeter,
	Customer,
	Storage,
} from "@/types/data";

// --- Helper Function ---
// Fungsi ini tidak berinteraksi langsung dengan API, jadi bisa tetap di sini.
const calculateFlowMeter = (
	readings: ReadingFromDB[]
): ReadingWithFlowMeter[] => {
	const sortedReadings = [...readings].sort(
		(a, b) =>
			new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
	);

	return sortedReadings.map((reading, index) => {
		const previousReading = sortedReadings
			.slice(0, index)
			.reverse()
			.find((r) => r.storage_number === reading.storage_number);

		let flowMeter: number | string = "-";
		if (previousReading) {
			const difference =
				reading.flow_turbine - previousReading.flow_turbine;
			flowMeter = difference >= 0 ? difference : "-";
		}
		return { ...reading, flowMeter };
	});
};

// === API Functions for Readings ===

export const getAllReadings = async (): Promise<ReadingWithFlowMeter[]> => {
	const { data, error } = await supabase
		.from("readings")
		.select(`*, profiles(username)`)
		.order("created_at", { ascending: false });
	if (error) throw error;
	return calculateFlowMeter(data as ReadingFromDB[]);
};

export const getReadingsByCustomer = async (
	customerCode: string
): Promise<ReadingWithFlowMeter[]> => {
	if (!customerCode) return [];
	const { data, error } = await supabase
		.from("readings")
		.select(`*, profiles(username)`)
		.eq("customer_code", customerCode)
		.order("created_at", { ascending: false });
	if (error) throw error;
	return calculateFlowMeter(data as ReadingFromDB[]);
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
