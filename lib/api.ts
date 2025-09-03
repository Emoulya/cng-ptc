// cng-ptc/lib/api.ts

import type {
	NewReading,
	ReadingWithFlowMeter,
	Customer,
	Storage,
	NewStorage,
	UpdateCustomer,
	UpdateStorage,
	UpdateReading,
	NewDumpingData,
	UserProfile,
	NewProfileData,
	AnalyticsData,
	TimeSeriesData,
	TableRowData,
	NewStopReading,
} from "@/types/data";

// Helper function untuk mendapatkan token, bisa digunakan di semua fungsi API
const getAuthHeaders = (): Record<string, string> => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("access_token");
		if (token) {
			return {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			};
		}
	}
	throw new Error("User not authenticated");
};

// Helper untuk menangani response
const handleResponse = async (response: Response) => {
	if (!response.ok) {
		// Cek jika body kosong (misal: DELETE response)
		if (
			response.status === 204 ||
			response.headers.get("content-length") === "0"
		) {
			return;
		}
		const errorData = await response.json();
		throw new Error(errorData.message || "An API error occurred");
	}
	// Cek lagi untuk kasus body kosong setelah response.ok
	if (
		response.status === 204 ||
		response.headers.get("content-length") === "0"
	) {
		return;
	}
	return response.json();
};

export interface ReadingFilters {
	customer: string;
	operator: string;
	searchTerm: string;
	sortOrder: "asc" | "desc";
	timeRange: "day" | "week" | "month" | "all";
}

// === API Functions for Readings ===

export const getAllReadings = async (
	filters: ReadingFilters
): Promise<ReadingWithFlowMeter[]> => {
	const queryParams = new URLSearchParams({
		customer: filters.customer || "all",
		operator: filters.operator || "all",
		searchTerm: filters.searchTerm || "",
		sortOrder: filters.sortOrder || "asc",
		timeRange: filters.timeRange || "week",
	}).toString();
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings?${queryParams}`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const getReadingsByCustomer = async (
	customerCode: string
): Promise<ReadingWithFlowMeter[]> => {
	if (!customerCode) return [];
	return getAllReadings({
		customer: customerCode,
		operator: "all",
		searchTerm: "",
		sortOrder: "asc",
		timeRange: "week",
	});
};

export const getProcessedReadingsByCustomer = async (
	customerCode: string,
	timeRange: "day" | "week" | "month" | "all"
): Promise<TableRowData[]> => {
	if (!customerCode) return [];
	// Tambahkan timeRange sebagai query parameter
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings/processed/${customerCode}?timeRange=${timeRange}`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const addReading = async (reading: NewReading): Promise<void> => {
	const date = new Date(reading.recorded_at);
	const manual_created_at = `${date
		.getHours()
		.toString()
		.padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
	const payload = {
		customer_code: reading.customer_code,
		storage_number: reading.storage_number,
		psi: reading.psi,
		temp: reading.temp,
		psi_out: reading.psi_out,
		flow_turbine: reading.flow_turbine,
		remarks: reading.remarks,
		fixed_storage_quantity: reading.fixed_storage_quantity,
		manual_created_at,
	};
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings`,
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(payload),
		}
	);
	return handleResponse(response);
};

export const addStopReading = async (
	stopReading: NewStopReading
): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings/stop`,
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(stopReading),
		}
	);
	return handleResponse(response);
};

export const updateReading = async (reading: UpdateReading): Promise<void> => {
	const { id, ...payload } = reading;
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings/${id}`,
		{
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify(payload),
		}
	);
	return handleResponse(response);
};

export const deleteReading = async (id: number): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings/${id}`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const deleteAllReadings = async (): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings/all`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

// === API Functions for Customers ===

export const getCustomers = async (): Promise<Customer[]> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/customers`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const addCustomer = async (customer: {
	code: string;
	name: string | null;
}): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/customers`,
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify({
				code: customer.code.toUpperCase(),
				name: customer.name || null,
			}),
		}
	);
	return handleResponse(response);
};

export const updateCustomer = async (
	customer: UpdateCustomer
): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/customers/${customer.id}`,
		{
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify({ name: customer.name || null }),
		}
	);
	return handleResponse(response);
};

export const deleteCustomer = async (id: number): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

// === API Functions for Storages ===

export const getStorages = async (): Promise<Storage[]> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/storages`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const getStoragesForOperator = async (
	customerCode: string
): Promise<Storage[]> => {
	if (!customerCode) return [];
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/storages/relevant/${customerCode}`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const updateStorage = async (storage: UpdateStorage): Promise<void> => {
	const payload = {
		type: storage.type,
		customer_code: storage.type === "fixed" ? storage.customer_code : null,
		default_quantity:
			storage.type === "fixed" ? Number(storage.default_quantity) : null,
	};
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/storages/${storage.id}`,
		{
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify(payload),
		}
	);
	return handleResponse(response);
};

export const addStorage = async (storage: NewStorage): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/storages`,
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(storage),
		}
	);
	return handleResponse(response);
};

export const deleteStorage = async (id: number): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/storages/${id}`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const addDumpingReading = async (
	dumpingData: NewDumpingData
): Promise<void> => {
	// Hapus operator_id karena backend akan mengambilnya dari token
	const { operator_id, ...payload } = dumpingData;

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/readings/dumping`,
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(payload),
		}
	);
	return handleResponse(response);
};

export const getProfiles = async (): Promise<UserProfile[]> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/profiles`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const createProfile = async (
	profileData: NewProfileData
): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/profiles`,
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(profileData),
		}
	);
	return handleResponse(response);
};

export const deleteProfile = async (id: string): Promise<void> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

// === API Functions for Analytics ===

export const getOverallStats = async (): Promise<AnalyticsData> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/analytics/stats`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};

export const getReadingsOverTime = async (
	startDate: string,
	endDate: string
): Promise<TimeSeriesData[]> => {
	const queryParams = new URLSearchParams({ startDate, endDate }).toString();
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/analytics/readings-over-time?${queryParams}`,
		{
			headers: getAuthHeaders(),
		}
	);
	return handleResponse(response);
};
