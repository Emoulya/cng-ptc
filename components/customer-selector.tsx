"use client";

import { useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase-client";

interface Customer {
	code: string;
	name: string | null;
}

interface CustomerSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchCustomers = async () => {
			setIsLoading(true);
			const { data, error } = await supabase
				.from("customers")
				.select("code, name")
				.order("code", { ascending: true });

			if (error) {
				console.error("Error fetching customers:", error);
				// Anda bisa menambahkan notifikasi toast di sini jika terjadi error
			} else {
				setCustomers(data);
			}
			setIsLoading(false);
		};

		fetchCustomers();
	}, []);

	return (
		<Select
			value={value}
			onValueChange={onChange}
			disabled={isLoading}>
			<SelectTrigger className="w-full">
				<SelectValue
					placeholder={
						isLoading ? "Memuat pelanggan..." : "Pilih pelanggan..."
					}
				/>
			</SelectTrigger>
			<SelectContent>
				{customers.map((customer) => (
					<SelectItem
						key={customer.code}
						value={customer.code}>
						{/* Tampilkan nama jika ada, jika tidak tampilkan kode */}
						{customer.name || customer.code}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
