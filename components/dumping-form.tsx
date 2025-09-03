// components\dumping-form.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
	useAddDumping,
	useProcessedReadingsByCustomer,
} from "@/hooks/use-readings";
import { useStoragesForOperator } from "@/hooks/use-storages";
import { ArrowRight, Save, Wind, Loader2 } from "lucide-react";
import type { NewDumpingData, ReadingWithFlowMeter } from "@/types/data";

interface DumpingFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

const initialFormData = {
	source_storage_number: "",
	destination_storage_number: "",
	source_psi_before: "",
	source_psi_after: "",
	destination_psi_after: "",
	source_temp_before: "",
	source_temp_after: "",
	destination_temp: "",
	flow_turbine_before: "",
	flow_turbine_after: "",
	psi_out: "",
	time_before: "",
	time_after: "",
};

export function DumpingForm({ customerCode, onSuccess }: DumpingFormProps) {
	const { user } = useAuth();
	const { data: storages = [], isLoading: isLoadingStorages } =
		useStoragesForOperator(customerCode);
	const { data: readings = [] } =
		useProcessedReadingsByCustomer(customerCode , "all");
	const { mutate: addDumping, isPending: isSubmitting } = useAddDumping();

	const [formData, setFormData] = useState(initialFormData);

	// Reset form jika customer berubah
	useEffect(() => {
		setFormData(initialFormData);
	}, [customerCode]);

	// Efek untuk MENGISI OTOMATIS form saat pertama kali dibuka
	useEffect(() => {
		if (
			storages.length > 1 &&
			readings.length > 0 &&
			!formData.destination_storage_number
		) {
			// Saring untuk mendapatkan data valid yang punya nomor storage
			const validReadings = readings.filter(
				(r): r is ReadingWithFlowMeter =>
					"storage_number" in r && !!r.storage_number
			);

			if (validReadings.length === 0) return;

			// Tentukan TUJUAN: storage yang paling terakhir digunakan
			const lastUsedStorageNumber =
				validReadings[validReadings.length - 1].storage_number;

			// Update state form dengan nilai tujuan yang sudah ditentukan
			// Storage sumber dibiarkan kosong
			if (lastUsedStorageNumber) {
				setFormData((prev) => ({
					...prev,
					destination_storage_number: lastUsedStorageNumber,
					source_storage_number: "",
				}));
			}
		}
	}, [storages, readings]);

	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("Authentication Error", {
				description: "User not found.",
			});
			return;
		}

		// Validasi sederhana
		for (const key in formData) {
			if (formData[key as keyof typeof formData] === "") {
				toast.error("Validation Error", {
					description: `Mohon isi semua field. Field '${key}' kosong.`,
				});
				return;
			}
		}

		const submissionData: NewDumpingData = {
			customer_code: customerCode,
			operator_id: user.id,
			source_storage_number: formData.source_storage_number,
			destination_storage_number: formData.destination_storage_number,
			source_psi_before: parseFloat(formData.source_psi_before),
			source_psi_after: parseFloat(formData.source_psi_after),
			destination_psi_after: parseFloat(formData.destination_psi_after),
			source_temp_before: parseFloat(formData.source_temp_before),
			source_temp_after: parseFloat(formData.source_temp_after),
			destination_temp: parseFloat(formData.destination_temp),
			flow_turbine_before: parseFloat(formData.flow_turbine_before),
			flow_turbine_after: parseFloat(formData.flow_turbine_after),
			psi_out: parseFloat(formData.psi_out),
			time_before: formData.time_before,
			time_after: formData.time_after,
		};

		addDumping(submissionData, {
			onSuccess: () => {
				setFormData(initialFormData);
				onSuccess?.();
			},
		});
	};

	return (
		<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
			<CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
				<CardTitle className="text-lg flex items-center gap-2 text-gray-800">
					<Wind className="h-5 w-5 text-orange-600" />
					Input Data Dumping - {customerCode}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<form
					onSubmit={handleSubmit}
					className="space-y-6">
					{/* Pemilihan Storage */}
					<div className="flex items-end gap-4">
						<div className="flex-1 space-y-2">
							<Label htmlFor="source_storage_number">
								Storage Sumber
							</Label>
							<Select
								value={formData.source_storage_number}
								onValueChange={(value) =>
									handleInputChange(
										"source_storage_number",
										value
									)
								}
								disabled={isLoadingStorages}>
								<SelectTrigger>
									<SelectValue placeholder="Pilih sumber..." />
								</SelectTrigger>
								<SelectContent>
									{storages.map((s) => (
										<SelectItem
											key={s.id}
											value={s.storage_number}>
											{s.storage_number}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<ArrowRight className="h-6 w-6 text-gray-500 mb-2" />
						<div className="flex-1 space-y-2">
							<Label htmlFor="destination_storage_number">
								Storage Tujuan
							</Label>
							<Select
								value={formData.destination_storage_number}
								onValueChange={(value) =>
									handleInputChange(
										"destination_storage_number",
										value
									)
								}
								disabled={isLoadingStorages}>
								<SelectTrigger>
									<SelectValue placeholder="Pilih tujuan..." />
								</SelectTrigger>
								<SelectContent>
									{storages.map((s) => (
										<SelectItem
											key={s.id}
											value={s.storage_number}>
											{s.storage_number}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Grid untuk Data */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
						{/* Kolom Sebelum */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="font-semibold text-center">
								Sebelum Dumping
							</h3>
							<div className="space-y-2">
								<Label>Waktu Mulai</Label>
								<Input
									type="time"
									value={formData.time_before}
									onChange={(e) =>
										handleInputChange(
											"time_before",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Pressure Sumber</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 2650"
									value={formData.source_psi_before}
									onChange={(e) =>
										handleInputChange(
											"source_psi_before",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Temp Sumber</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 32"
									value={formData.source_temp_before}
									onChange={(e) =>
										handleInputChange(
											"source_temp_before",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Flow/Turbin</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 440155"
									value={formData.flow_turbine_before}
									onChange={(e) =>
										handleInputChange(
											"flow_turbine_before",
											e.target.value
										)
									}
								/>
							</div>
						</div>

						{/* Kolom Sesudah */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="font-semibold text-center">
								Sesudah Dumping
							</h3>
							<div className="space-y-2">
								<Label>Waktu Selesai</Label>
								<Input
									type="time"
									value={formData.time_after}
									onChange={(e) =>
										handleInputChange(
											"time_after",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Pressure Sumber</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 2000"
									value={formData.source_psi_after}
									onChange={(e) =>
										handleInputChange(
											"source_psi_after",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Temp Sumber</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 28"
									value={formData.source_temp_after}
									onChange={(e) =>
										handleInputChange(
											"source_temp_after",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Flow/Turbin</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 440173"
									value={formData.flow_turbine_after}
									onChange={(e) =>
										handleInputChange(
											"flow_turbine_after",
											e.target.value
										)
									}
								/>
							</div>
						</div>

						{/* Kolom Tujuan & Umum */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="font-semibold text-center">
								Data Tujuan & Umum
							</h3>
							<div className="space-y-2">
								<Label>Pressure Tujuan (Setelah)</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 1537"
									value={formData.destination_psi_after}
									onChange={(e) =>
										handleInputChange(
											"destination_psi_after",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Temp Tujuan (Setelah)</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 24"
									value={formData.destination_temp}
									onChange={(e) =>
										handleInputChange(
											"destination_temp",
											e.target.value
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Pressure Out</Label>
								<Input
									type="number"
									step="0.1"
									placeholder="e.g. 1"
									value={formData.psi_out}
									onChange={(e) =>
										handleInputChange(
											"psi_out",
											e.target.value
										)
									}
								/>
							</div>
						</div>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg">
						{isSubmitting ? (
							<Loader2 className="animate-spin" />
						) : (
							<>
								<Save className="h-5 w-5 mr-2" />
								Simpan Data Dumping
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
