"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUpdateReading } from "@/hooks/use-readings";
import { useStoragesForOperator } from "@/hooks/use-storages";
import type { ReadingWithFlowMeter } from "@/types/data";
import { Loader2 } from "lucide-react";

// Helper function untuk konversi UTC ke local datetime string
const toLocalISOString = (date: Date) => {
	const tzOffset = -date.getTimezoneOffset();
	const diff = tzOffset >= 0 ? "+" : "-";
	const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");
	return (
		date.getFullYear() +
		"-" +
		pad(date.getMonth() + 1) +
		"-" +
		pad(date.getDate()) +
		"T" +
		pad(date.getHours()) +
		":" +
		pad(date.getMinutes())
	);
};

interface EditReadingFormProps {
	reading: ReadingWithFlowMeter;
	onSuccess: () => void;
}

export function EditReadingForm({ reading, onSuccess }: EditReadingFormProps) {
	const [formData, setFormData] = useState({
		storage_number: reading.storage_number,
		fixed_storage_quantity: reading.fixed_storage_quantity,
		created_at: toLocalISOString(new Date(reading.created_at)),
		psi: reading.psi,
		temp: reading.temp,
		psi_out: reading.psi_out,
		flow_turbine: reading.flow_turbine,
	});

	const { mutate: updateReading, isPending } = useUpdateReading();
	const { data: storages = [], isLoading: isLoadingStorages } =
		useStoragesForOperator(reading.customer_code);

	const handleInputChange = (
		field: keyof typeof formData,
		value: string | number
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const { created_at, ...updateData } = formData;

		updateReading(
			{
				id: reading.id,
				...updateData,
				fixed_storage_quantity: Number(
					updateData.fixed_storage_quantity
				),
				psi: Number(updateData.psi),
				temp: Number(updateData.temp),
				psi_out: Number(updateData.psi_out),
				flow_turbine: Number(updateData.flow_turbine),
			},
			{
				onSuccess: () => {
					onSuccess();
				},
			}
		);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="storage_number">Storage</Label>
					<Select
						value={formData.storage_number}
						onValueChange={(value) =>
							handleInputChange("storage_number", value)
						}
						disabled={isLoadingStorages}>
						<SelectTrigger>
							<SelectValue placeholder="Pilih storage..." />
						</SelectTrigger>
						<SelectContent>
							{storages.map((storage) => (
								<SelectItem
									key={storage.id}
									value={storage.storage_number}>
									<div className="flex justify-between w-full">
										<span>{storage.storage_number}</span>
										<span className="text-xs text-gray-500 capitalize">
											{storage.type}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="fixed_storage_quantity">Jml. Storage</Label>
					<Input
						id="fixed_storage_quantity"
						type="number"
						value={formData.fixed_storage_quantity}
						onChange={(e) =>
							handleInputChange(
								"fixed_storage_quantity",
								Number(e.target.value)
							)
						}
					/>
				</div>
			</div>
			<div className="space-y-2">
				<Label htmlFor="created_at">Date & Time</Label>
				<Input
					id="created_at"
					type="datetime-local"
					value={formData.created_at}
					disabled
					className="cursor-not-allowed bg-gray-100"
				/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="psi">PSI</Label>
					<Input
						id="psi"
						type="number"
						step="0.1"
						value={formData.psi}
						onChange={(e) =>
							handleInputChange("psi", Number(e.target.value))
						}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="temp">Temp</Label>
					<Input
						id="temp"
						type="number"
						step="0.1"
						value={formData.temp}
						onChange={(e) =>
							handleInputChange("temp", Number(e.target.value))
						}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="psi_out">PSI Out</Label>
					<Input
						id="psi_out"
						type="number"
						step="0.1"
						value={formData.psi_out}
						onChange={(e) =>
							handleInputChange("psi_out", Number(e.target.value))
						}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="flow_turbine">Flow/Turbin</Label>
					<Input
						id="flow_turbine"
						type="number"
						step="0.1"
						value={formData.flow_turbine}
						onChange={(e) =>
							handleInputChange(
								"flow_turbine",
								Number(e.target.value)
							)
						}
					/>
				</div>
			</div>
			<Button
				type="submit"
				disabled={isPending}
				className="w-full">
				{isPending ? (
					<Loader2 className="animate-spin" />
				) : (
					"Simpan Perubahan"
				)}
			</Button>
		</form>
	);
}
