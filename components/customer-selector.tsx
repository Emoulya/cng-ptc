"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/use-customers";

interface CustomerSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
	const { data: customers = [], isLoading } = useCustomers();

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
						{customer.name || customer.code}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
