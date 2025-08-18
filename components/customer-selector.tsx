"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/use-customers";
import { Building2 } from "lucide-react";

interface CustomerSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
	const { data: customers = [], isLoading } = useCustomers();

	return (
		<div className="space-y-2">
			<Select
				value={value}
				onValueChange={onChange}
				disabled={isLoading}>
				<SelectTrigger className="w-full h-12 border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 focus:border-blue-500 transition-all duration-200">
					<div className="flex items-center gap-2">
						<Building2 className="h-4 w-4 text-gray-500" />
						<SelectValue
							placeholder={
								isLoading
									? "Memuat pelanggan..."
									: "Pilih pelanggan..."
							}
						/>
					</div>
				</SelectTrigger>
				<SelectContent className="bg-white/95 backdrop-blur-md border-gray-200 shadow-xl">
					{customers.map((customer) => (
						<SelectItem
							key={customer.code}
							value={customer.code}
							className="hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								{customer.name || customer.code}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
