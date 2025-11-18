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
import { dumpingFormSchema, type TDumpingFormSchema } from "@/lib/schemas";
import { ArrowRight, Save, Wind, Loader2, AlertCircle } from "lucide-react";
import type { NewDumpingData, ReadingWithFlowMeter } from "@/types/data";

interface DumpingFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

// Tipe untuk error messages per field
type FieldErrors = Partial<Record<keyof TDumpingFormSchema, string>>;

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
	const { data: readings = [] } = useProcessedReadingsByCustomer(
		customerCode,
		"all"
	);
	const { mutate: addDumping, isPending: isSubmitting } = useAddDumping();

	const [formData, setFormData] = useState(initialFormData);
	const [errors, setErrors] = useState<FieldErrors>({});

	// Reset form jika customer berubah
	useEffect(() => {
		setFormData(initialFormData);
		setErrors({});
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

			// storage yang paling terakhir digunakan
			const lastUsedStorageNumber =
				validReadings[validReadings.length - 1].storage_number;

			// Update state form dengan nilai tujuan yang sudah ditentukan
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
		if (errors[field as keyof TDumpingFormSchema]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("Authentication Error", {
				description: "User not found.",
			});
			return;
		}

		// Validasi menggunakan Zod schema
		const validationResult = dumpingFormSchema.safeParse(formData);

		if (!validationResult.success) {
			// Parse Zod errors dan tampilkan ke user
			const fieldErrors: FieldErrors = {};
			validationResult.error.issues.forEach((issue) => {
				const fieldName = issue.path[0] as keyof TDumpingFormSchema;
				if (fieldName) {
					fieldErrors[fieldName] = issue.message;
				}
			});
			setErrors(fieldErrors);

			toast.error("Validasi Gagal", {
				description: "Mohon perbaiki field yang ditandai merah",
			});
			return;
		}

		// Data sudah valid, lanjutkan proses submit
		const validatedData = validationResult.data;

		const submissionData: NewDumpingData = {
			customer_code: customerCode,
			operator_id: user.id,
			source_storage_number: validatedData.source_storage_number,
			destination_storage_number:
				validatedData.destination_storage_number,
			source_psi_before: validatedData.source_psi_before,
			source_psi_after: validatedData.source_psi_after,
			destination_psi_after: validatedData.destination_psi_after,
			source_temp_before: validatedData.source_temp_before,
			source_temp_after: validatedData.source_temp_after,
			destination_temp: validatedData.destination_temp,
			flow_turbine_before: validatedData.flow_turbine_before,
			flow_turbine_after: validatedData.flow_turbine_after,
			psi_out: validatedData.psi_out,
			time_before: validatedData.time_before,
			time_after: validatedData.time_after,
		};

		addDumping(submissionData, {
			onSuccess: () => {
				setFormData(initialFormData);
				setErrors({});
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
								Storage Sumber{" "}
								<span className="text-red-500">*</span>
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
								<SelectTrigger
									className={
										errors.source_storage_number
											? "border-red-500 focus:ring-red-500"
											: ""
									}>
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
							{errors.source_storage_number && (
								<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
									<AlertCircle className="h-4 w-4" />
									{errors.source_storage_number}
								</p>
							)}
						</div>
						<ArrowRight className="h-6 w-6 text-gray-500 mb-2" />
						<div className="flex-1 space-y-2">
							<Label htmlFor="destination_storage_number">
								Storage Tujuan{" "}
								<span className="text-red-500">*</span>
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
								<SelectTrigger
									className={
										errors.destination_storage_number
											? "border-red-500 focus:ring-red-500"
											: ""
									}>
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
							{errors.destination_storage_number && (
								<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
									<AlertCircle className="h-4 w-4" />
									{errors.destination_storage_number}
								</p>
							)}
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
								<Label>
									Waktu Mulai{" "}
									<span className="text-red-500">*</span>
								</Label>
								<Input
									type="time"
									value={formData.time_before}
									onChange={(e) =>
										handleInputChange(
											"time_before",
											e.target.value
										)
									}
									className={
										errors.time_before
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.time_before && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.time_before}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Pressure Sumber{" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.source_psi_before
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.source_psi_before && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.source_psi_before}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Temp Sumber{" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.source_temp_before
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.source_temp_before && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.source_temp_before}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Flow/Turbin{" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.flow_turbine_before
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.flow_turbine_before && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.flow_turbine_before}
									</p>
								)}
							</div>
						</div>

						{/* Kolom Sesudah */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="font-semibold text-center">
								Sesudah Dumping
							</h3>
							<div className="space-y-2">
								<Label>
									Waktu Selesai{" "}
									<span className="text-red-500">*</span>
								</Label>
								<Input
									type="time"
									value={formData.time_after}
									onChange={(e) =>
										handleInputChange(
											"time_after",
											e.target.value
										)
									}
									className={
										errors.time_after
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.time_after && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.time_after}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Pressure Sumber{" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.source_psi_after
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.source_psi_after && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.source_psi_after}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Temp Sumber{" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.source_temp_after
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.source_temp_after && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.source_temp_after}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Flow/Turbin{" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.flow_turbine_after
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.flow_turbine_after && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.flow_turbine_after}
									</p>
								)}
							</div>
						</div>

						{/* Kolom Tujuan & Umum */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="font-semibold text-center">
								Data Tujuan & Umum
							</h3>
							<div className="space-y-2">
								<Label>
									Pressure Tujuan (Setelah){" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.destination_psi_after
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.destination_psi_after && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.destination_psi_after}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Temp Tujuan (Setelah){" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.destination_temp
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.destination_temp && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.destination_temp}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>
									Pressure Out{" "}
									<span className="text-red-500">*</span>
								</Label>
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
									className={
										errors.psi_out
											? "border-red-500 focus:ring-red-500"
											: ""
									}
								/>
								{errors.psi_out && (
									<p className="text-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.psi_out}
									</p>
								)}
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
