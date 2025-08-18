"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useAddReading } from "@/hooks/use-readings";
import { useStorages } from "@/hooks/use-storages";
import {
	Calendar,
	Clock,
	Thermometer,
	Gauge,
	Wind,
	FileText,
	Database,
	Save,
} from "lucide-react";

interface DataEntryFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

// Membuat daftar opsi jam dari "00:00" sampai "23:00"
const hourOptions = Array.from({ length: 24 }, (_, i) => {
	const hour = i.toString().padStart(2, "0");
	return `${hour}:00`;
});

export function DataEntryForm({ customerCode, onSuccess }: DataEntryFormProps) {
	const { mutate: addReading, isPending: isSubmitting } = useAddReading();
	const { data: storages = [], isLoading: isLoadingStorages } = useStorages();
	const { user } = useAuth();

	// State hanya untuk form
	const [formData, setFormData] = useState({
		recordingHour: "",
		fixedStorageQuantity: "",
		storage: "",
		psi: "",
		temp: "",
		psiOut: "",
		flowTurbine: "",
		remarks: "",
	});

	const currentDate = new Date().toLocaleDateString("id-ID", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "long",
		day: "numeric",
		weekday: "long",
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("Authentication Error", {
				description: "User not found. Please log in again.",
			});
			return;
		}

		if (
			!formData.recordingHour ||
			!formData.fixedStorageQuantity ||
			!formData.storage ||
			!formData.psi ||
			!formData.temp ||
			!formData.psiOut ||
			!formData.flowTurbine
		) {
			toast.error("Validation Error", {
				description: "Mohon isi semua field yang ditandai bintang (*)",
			});
			return;
		}

		const today = new Date();
		const [hour] = formData.recordingHour.split(":").map(Number);
		today.setHours(hour, 0, 0, 0);
		const finalTimestamp = today.toISOString();

		addReading(
			{
				created_at: finalTimestamp,
				customer_code: customerCode,
				operator_id: user.id,
				fixed_storage_quantity: Number.parseInt(
					formData.fixedStorageQuantity
				),
				storage_number: formData.storage,
				psi: Number.parseFloat(formData.psi),
				temp: Number.parseFloat(formData.temp),
				psi_out: Number.parseFloat(formData.psiOut),
				flow_turbine: Number.parseFloat(formData.flowTurbine),
				remarks: formData.remarks,
			},
			{
				onSuccess: () => {
					setFormData({
						recordingHour: "",
						fixedStorageQuantity: "",
						storage: "",
						psi: "",
						temp: "",
						psiOut: "",
						flowTurbine: "",
						remarks: "",
					});
					onSuccess?.();
				},
			}
		);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6">
			{/* Enhanced Date Display */}
			<Card className="shadow-lg border-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white overflow-hidden relative">
				<div className="absolute inset-0 bg-black/10"></div>
				<CardContent className="pt-6 relative z-10">
					<div className="text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Calendar className="h-5 w-5" />
							<p className="text-orange-100 font-medium">
								Tanggal Pencatatan
							</p>
						</div>
						<p className="text-2xl font-bold mb-1">{currentDate}</p>
						<p className="text-xs text-orange-200 font-medium bg-black/20 inline-block px-3 py-1 rounded-full">
							(Tanggal hari ini, tidak bisa diubah)
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Form Fields Grid */}
			<div className="grid gap-6">
				{/* Storage Selection */}
				<div className="space-y-3">
					<Label
						htmlFor="storage"
						className="text-base font-semibold text-gray-700 flex items-center gap-2">
						<Database className="h-4 w-4 text-blue-600" />
						Storage <span className="text-red-500">*</span>
					</Label>
					<Select
						value={formData.storage}
						onValueChange={(value) =>
							handleInputChange("storage", value)
						}
						disabled={isLoadingStorages}>
						<SelectTrigger className="h-12 border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 focus:border-blue-500 transition-all duration-200">
							<SelectValue
								placeholder={
									isLoadingStorages
										? "Memuat..."
										: "Pilih nomor storage..."
								}
							/>
						</SelectTrigger>
						<SelectContent className="bg-white/95 backdrop-blur-md border-gray-200 shadow-xl max-h-60">
							{storages.map((storage) => (
								<SelectItem
									key={storage.storage_number}
									value={storage.storage_number}
									className="hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
										{storage.storage_number}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Fixed Storage Quantity */}
				<div className="space-y-3">
					<Label
						htmlFor="fixedStorageQuantity"
						className="text-base font-semibold text-gray-700 flex items-center gap-2">
						<Database className="h-4 w-4 text-green-600" />
						Jumlah Fix Storage{" "}
						<span className="text-red-500">*</span>
					</Label>
					<Select
						value={formData.fixedStorageQuantity}
						onValueChange={(value) =>
							handleInputChange("fixedStorageQuantity", value)
						}>
						<SelectTrigger className="h-12 border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-green-300 focus:border-green-500 transition-all duration-200">
							<SelectValue placeholder="Pilih jumlah..." />
						</SelectTrigger>
						<SelectContent className="bg-white/95 backdrop-blur-md border-gray-200 shadow-xl">
							{[1, 2, 3, 4, 5].map((num) => (
								<SelectItem
									key={num}
									value={num.toString()}
									className="hover:bg-green-50 focus:bg-green-50 transition-colors duration-150">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										{num}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Recording Hour */}
				<div className="space-y-3">
					<Label
						htmlFor="recordingHour"
						className="text-base font-semibold text-gray-700 flex items-center gap-2">
						<Clock className="h-4 w-4 text-purple-600" />
						Jam Pencatatan <span className="text-red-500">*</span>
					</Label>
					<Select
						value={formData.recordingHour}
						onValueChange={(value) =>
							handleInputChange("recordingHour", value)
						}>
						<SelectTrigger className="h-12 border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300 focus:border-purple-500 transition-all duration-200">
							<SelectValue placeholder="Pilih jam pencatatan..." />
						</SelectTrigger>
						<SelectContent className="bg-white/95 backdrop-blur-md border-gray-200 shadow-xl max-h-60">
							{hourOptions.map((hour) => (
								<SelectItem
									key={hour}
									value={hour}
									className="hover:bg-purple-50 focus:bg-purple-50 transition-colors duration-150 font-mono">
									{hour}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Measurement Fields Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* PSI */}
					<div className="space-y-3">
						<Label
							htmlFor="psi"
							className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<Gauge className="h-4 w-4 text-red-600" />
							PSI <span className="text-red-500">*</span>
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
							className="h-12 text-base border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-red-300 focus:border-red-500 transition-all duration-200"
						/>
					</div>

					{/* Temperature */}
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
							className="h-12 text-base border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-orange-300 focus:border-orange-500 transition-all duration-200"
						/>
					</div>

					{/* PSI Out */}
					<div className="space-y-3">
						<Label
							htmlFor="psiOut"
							className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<Gauge className="h-4 w-4 text-indigo-600" />
							PSI Out <span className="text-red-500">*</span>
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
							className="h-12 text-base border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-indigo-300 focus:border-indigo-500 transition-all duration-200"
						/>
					</div>

					{/* Flow Turbine */}
					<div className="space-y-3">
						<Label
							htmlFor="flowTurbine"
							className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<Wind className="h-4 w-4 text-cyan-600" />
							Flow/Turbin <span className="text-red-500">*</span>
						</Label>
						<Input
							id="flowTurbine"
							type="number"
							step="0.1"
							placeholder="0.0"
							value={formData.flowTurbine}
							onChange={(e) =>
								handleInputChange("flowTurbine", e.target.value)
							}
							className="h-12 text-base border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-cyan-300 focus:border-cyan-500 transition-all duration-200"
						/>
					</div>
				</div>

				{/* Remarks */}
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

				{/* Enhanced Submit Button */}
				<Button
					type="submit"
					className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
					disabled={isSubmitting}>
					<Save className="h-5 w-5 mr-2" />
					{isSubmitting
						? "Menyimpan Data..."
						: "Simpan Data Gas Storage"}
				</Button>
			</div>
		</form>
	);
}
