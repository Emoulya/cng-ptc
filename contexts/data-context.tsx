"use client";

import { createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";

// Tipe data baru yang sesuai dengan hasil query dari Supabase
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

// Tipe data ini digunakan saat mengirim data BARU ke Supabase
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

interface DataContextType {
	addReading: (reading: NewReading) => Promise<void>;
	getReadingsByCustomer: (
		customerCode: string
	) => Promise<ReadingWithFlowMeter[]>;
	getAllReadings: () => Promise<ReadingWithFlowMeter[]>;
	deleteReading: (id: number) => Promise<void>;
	clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Fungsi helper untuk kalkulasi flow meter tetap sama, tapi inputnya berubah
const calculateFlowMeter = (
	readingsArray: ReadingFromDB[]
): ReadingWithFlowMeter[] => {
	const sortedReadings = [...readingsArray].sort(
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

		return {
			...reading,
			flowMeter,
		};
	});
};

export function DataProvider({ children }: { children: ReactNode }) {
	const addReading = async (reading: NewReading) => {
		const { error } = await supabase.from("readings").insert(reading);
		if (error) throw error;
	};

	const getReadingsByCustomer = async (
		customerCode: string
	): Promise<ReadingWithFlowMeter[]> => {
		const { data, error } = await supabase
			.from("readings")
			.select(`*, profiles(username)`)
			.eq("customer_code", customerCode)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching readings by customer:", error);
			return [];
		}

		return calculateFlowMeter(data as ReadingFromDB[]);
	};

	const getAllReadings = async (): Promise<ReadingWithFlowMeter[]> => {
		const { data, error } = await supabase
			.from("readings")
			.select(`*, profiles(username)`)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching all readings:", error);
			return [];
		}
		return calculateFlowMeter(data as ReadingFromDB[]);
	};

	const deleteReading = async (id: number) => {
		const { error } = await supabase
			.from("readings")
			.delete()
			.match({ id });
		if (error) throw error;
	};

	const clearAllData = async () => {
		// Ini adalah cara sederhana untuk menghapus semua data.
		// Untuk keamanan lebih, di masa depan ini bisa diubah menjadi satu panggilan
		// ke PostgreSQL function di server yang hanya bisa diakses admin.
		const { data: allIds, error: fetchError } = await supabase
			.from("readings")
			.select("id");

		if (fetchError) throw fetchError;

		if (allIds && allIds.length > 0) {
			const idsToDelete = allIds.map((item) => item.id);
			const { error: deleteError } = await supabase
				.from("readings")
				.delete()
				.in("id", idsToDelete);
			if (deleteError) throw deleteError;
		}
	};

	return (
		<DataContext.Provider
			value={{
				addReading,
				getReadingsByCustomer,
				getAllReadings,
				deleteReading,
				clearAllData,
			}}>
			{children}
		</DataContext.Provider>
	);
}

export function useData() {
	const context = useContext(DataContext);
	if (context === undefined) {
		throw new Error("useData must be used within a DataProvider");
	}
	return context;
}
