"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
	useAddStopReading,
	useProcessedReadingsByCustomer,
} from "@/hooks/use-readings";
import { stopFormSchema, type TStopFormSchema } from "@/lib/schemas";
import {
	Clock,
	Gauge,
	Wind,
	FileText,
	Save,
	Loader2,
	AlertTriangle,
	Thermometer,
	AlertCircle,
} from "lucide-react";
import type { ReadingWithFlowMeter } from "@/types/data";

interface StopFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

// Tipe untuk error messages per field
type FieldErrors = Partial<Record<keyof TStopFormSchema, string>>;

export function StopForm({ customerCode, onSuccess }: StopFormProps) {
	const { user } = useAuth();
	const [lastStorageNumber, setLastStorageNumber] = useState<string | null>(
		null
	);
	const [lastFixedQuantity, setLastFixedQuantity] = useState<number | null>(
		null
	);

	const { data: readings = [] } = useProcessedReadingsByCustomer(
		customerCode,
		"week"
	);

	const [formData, setFormData] = useState({
		recordingTime: "",
		psi: "",
		temp: "",
		psiOut: "",
		flowTurbine: "",
		remarks: "",
	});

	const [errors, setErrors] = useState<FieldErrors>({});

	useEffect(() => {
		if (readings.length > 0) {
			const lastReading = readings
				.slice()
				.reverse()
				.find(
					(r): r is ReadingWithFlowMeter =>
						"storage_number" in r && !!r.storage_number
				);
			if (lastReading) {
				setLastStorageNumber(lastReading.storage_number);
				setLastFixedQuantity(lastReading.fixed_storage_quantity);
			}
		}
	}, [readings]);

	const { mutate: addStopReading, isPending: isSubmitting } =
		useAddStopReading({
			onSuccess: () => {
				onSuccess?.();
				setFormData({
					recordingTime: "",
					psi: "",
					temp: "",
					psiOut: "",
					flowTurbine: "",
					remarks: "",
				});
				setErrors({});
			},
		});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field when user starts typing
		if (errors[field as keyof TStopFormSchema]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("Authentication Error");
			return;
		}
		if (!lastStorageNumber) {
			toast.error("Error", {
				description:
					"Tidak dapat menemukan data sebelumnya untuk melanjutkan.",
			});
			return;
		}

		// Validasi menggunakan Zod schema
		const validationResult = stopFormSchema.safeParse(formData);

		if (!validationResult.success) {
			// Parse Zod errors dan tampilkan ke user
			const fieldErrors: FieldErrors = {};
			validationResult.error.issues.forEach((issue) => {
				const fieldName = issue.path[0] as keyof TStopFormSchema;
				if (fieldName) {
					fieldErrors[fieldName] = issue.message;
				}
			});
			setErrors(fieldErrors);

			// Tampilkan toast error umum
			toast.error("Validasi Gagal", {
				description: "Mohon perbaiki field yang ditandai merah",
			});
			return;
		}

		// Data sudah valid, lanjutkan proses submit
		const validatedData = validationResult.data;

		addStopReading({
			customer_code: customerCode,
			storage_number: lastStorageNumber,
			manual_created_at: validatedData.recordingTime,
			psi: validatedData.psi,
			temp: validatedData.temp,
			psi_out: validatedData.psiOut,
			flow_turbine: validatedData.flowTurbine,
			remarks: validatedData.remarks,
		});
	};

	return (
		<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
			<CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
				<CardTitle className="text-lg flex items-center gap-2 text-gray-800">
					<AlertTriangle className="h-5 w-5 text-red-600" />
					Input Data STOP - {customerCode}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<form
					onSubmit={handleSubmit}
					className="space-y-6">
					<div className="text-center p-3 bg-gray-100 rounded-lg">
						<p className="text-sm text-gray-600">
							Data STOP ini akan mengakhiri sesi laporan untuk
							storage:
						</p>
						<p className="font-bold text-lg text-gray-800">
							{lastStorageNumber || "Tidak Ditemukan"}
						</p>
					</div>

					<div className="space-y-3">
						<Label
							htmlFor="recordingTime"
							className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<Clock className="h-4 w-4 text-purple-600" />
							Jam Pencatatan STOP{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Input
							id="recordingTime"
							type="time"
							value={formData.recordingTime}
							onChange={(e) =>
								handleInputChange(
									"recordingTime",
									e.target.value
								)
							}
							className={`h-12 text-base ${
								errors.recordingTime
									? "border-red-500 focus:ring-red-500"
									: ""
							}`}
						/>
						{errors.recordingTime && (
							<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
								<AlertCircle className="h-4 w-4" />
								{errors.recordingTime}
							</p>
						)}
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-3">
							<Label
								htmlFor="psi"
								className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Gauge className="h-4 w-4 text-red-600" />
								Pressure (PSI){" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="psi"
								type="number"
								step="0.1"
								placeholder="0.0"
								value={formData.psi}
								onChange={(e) =>
									handleInputChange("psi", e.target.value)
								}
								className={`h-12 text-base border-2 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
									errors.psi
										? "border-red-500 focus:border-red-600"
										: "border-gray-200 hover:border-red-300 focus:border-red-500"
								}`}
							/>
							{errors.psi && (
								<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
									<AlertCircle className="h-4 w-4" />
									{errors.psi}
								</p>
							)}
						</div>

						<div className="space-y-3">
							<Label
								htmlFor="temp"
								className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Thermometer className="h-4 w-4 text-orange-600" />
								Temperatur (°C){" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="temp"
								type="number"
								step="0.1"
								placeholder="0.0"
								value={formData.temp}
								onChange={(e) =>
									handleInputChange("temp", e.target.value)
								}
								className={`h-12 text-base border-2 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
									errors.temp
										? "border-red-500 focus:border-red-600"
										: "border-gray-200 hover:border-orange-300 focus:border-orange-500"
								}`}
							/>
							{errors.temp && (
								<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
									<AlertCircle className="h-4 w-4" />
									{errors.temp}
								</p>
							)}
						</div>

						<div className="space-y-3">
							<Label
								htmlFor="psiOut"
								className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Gauge className="h-4 w-4 text-indigo-600" />
								P. Out (Bar){" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="psiOut"
								type="number"
								step="0.1"
								placeholder="0.0"
								value={formData.psiOut}
								onChange={(e) =>
									handleInputChange("psiOut", e.target.value)
								}
								className={`h-12 text-base border-2 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
									errors.psiOut
										? "border-red-500 focus:border-red-600"
										: "border-gray-200 hover:border-indigo-300 focus:border-indigo-500"
								}`}
							/>
							{errors.psiOut && (
								<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
									<AlertCircle className="h-4 w-4" />
									{errors.psiOut}
								</p>
							)}
						</div>

						<div className="space-y-3">
							<Label
								htmlFor="flowTurbine"
								className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Wind className="h-4 w-4 text-cyan-600" />
								Flow/Turbin{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="flowTurbine"
								type="number"
								step="0.1"
								placeholder="0.0"
								value={formData.flowTurbine}
								onChange={(e) =>
									handleInputChange(
										"flowTurbine",
										e.target.value
									)
								}
								className={`h-12 text-base border-2 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
									errors.flowTurbine
										? "border-red-500 focus:border-red-600"
										: "border-gray-200 hover:border-cyan-300 focus:border-cyan-500"
								}`}
							/>
							{errors.flowTurbine && (
								<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
									<AlertCircle className="h-4 w-4" />
									{errors.flowTurbine}
								</p>
							)}
						</div>
					</div>

					<div className="space-y-3">
						<Label
							htmlFor="remarks"
							className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<FileText className="h-4 w-4 text-gray-600" />
							Keterangan
						</Label>
						<Textarea
							id="remarks"
							placeholder="Masukkan keterangan atau observasi..."
							value={formData.remarks}
							onChange={(e) =>
								handleInputChange("remarks", e.target.value)
							}
							className="text-base min-h-[100px] border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 focus:border-gray-500 transition-all duration-200 resize-none"
						/>
					</div>

					<Button
						type="submit"
						className="w-full h-14 text-base font-semibold bg-gradient-to-r from-red-600 to-orange-700 hover:from-red-700 hover:to-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
						disabled={isSubmitting || !lastStorageNumber}>
						{isSubmitting ? (
							<>
								<Loader2 className="h-5 w-5 mr-2 animate-spin" />
								Menyimpan...
							</>
						) : (
							<>
								<Save className="h-5 w-5 mr-2" />
								Simpan Data STOP
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
