"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useAddReading } from "@/hooks/use-readings";
import { useStoragesForOperator } from "@/hooks/use-storages";
import type { Storage } from "@/types/data";
import {
	Clock,
	Thermometer,
	Gauge,
	Wind,
	FileText,
	Database,
	Save,
	Truck,
	Building,
} from "lucide-react";

interface DataEntryFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

export function DataEntryForm({ customerCode, onSuccess }: DataEntryFormProps) {
	const { user } = useAuth();
	const { data: storages = [], isLoading: isLoadingStorages } =
		useStoragesForOperator(customerCode);

	// State untuk form
	const [formData, setFormData] = useState({
		recordingTime: "",
		storageNumber: "",
		fixedStorageQuantity: "",
		psi: "",
		temp: "",
		psiOut: "",
		flowTurbine: "",
		remarks: "",
	});
	const [selectedStorage, setSelectedStorage] = useState<Storage | null>(
		null
	);

	const lastSubmittedStorage = useRef<string | null>(null);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(
		null
	);

	// Hook mutasi useAddReading
	const { mutate: addReading, isPending: isSubmitting } = useAddReading({
		onSuccess: () => {
			onSuccess?.();
			setFormData({
				recordingTime: "",
				storageNumber: "",
				fixedStorageQuantity: "",
				psi: "",
				temp: "",
				psiOut: "",
				flowTurbine: "",
				remarks: "",
			});
			setSelectedStorage(null);
		},
	});

	// Reset form dan state storage terakhir jika customer berubah
	useEffect(() => {
		setFormData({
			recordingTime: "",
			storageNumber: "",
			fixedStorageQuantity: "",
			psi: "",
			temp: "",
			psiOut: "",
			flowTurbine: "",
			remarks: "",
		});
		setSelectedStorage(null);
		lastSubmittedStorage.current = null;
	}, [customerCode]);

	// Efek untuk mengisi jumlah storage otomatis
	useEffect(() => {
		if (selectedStorage) {
			const quantity =
				selectedStorage.type === "mobile"
					? "1"
					: selectedStorage.default_quantity?.toString() || "";
			setFormData((prev) => ({
				...prev,
				fixedStorageQuantity: quantity,
			}));
		} else {
			setFormData((prev) => ({ ...prev, fixedStorageQuantity: "" }));
		}
	}, [selectedStorage]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleStorageChange = (storageNumber: string) => {
		const storageObj =
			storages.find((s) => s.storage_number === storageNumber) || null;
		setSelectedStorage(storageObj);
		handleInputChange("storageNumber", storageNumber);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("Authentication Error");
			return;
		}

		// Validasi form
		const requiredFields = [
			"recordingTime",
			"storageNumber",
			"fixedStorageQuantity",
			"psi",
			"temp",
			"psiOut",
			"flowTurbine",
		];
		if (
			requiredFields.some(
				(field) => !formData[field as keyof typeof formData]
			)
		) {
			toast.error("Validation Error", {
				description: "Mohon isi semua field yang ditandai bintang (*)",
			});
			return;
		}

		// Fungsi untuk memproses dan mengirim data
		const processAndSubmit = () => {
			const localDate = new Date();
			const [hourStr, minuteStr] = formData.recordingTime.split(":");
			let inputHour = parseInt(hourStr, 10);
			if (parseInt(minuteStr, 10) >= 30) {
				inputHour += 1;
			}
			const utcDate = new Date(
				Date.UTC(
					localDate.getFullYear(),
					localDate.getMonth(),
					localDate.getDate(),
					inputHour,
					0,
					0
				)
			);

			const submissionData = {
				created_at: utcDate.toISOString(),
				customer_code: customerCode,
				operator_id: user.id,
				storage_number: formData.storageNumber,
				fixed_storage_quantity: parseInt(formData.fixedStorageQuantity),
				psi: parseFloat(formData.psi),
				temp: parseFloat(formData.temp),
				psi_out: parseFloat(formData.psiOut),
				flow_turbine: parseFloat(formData.flowTurbine),
				remarks: formData.remarks,
			};

			// Update storage terakhir yang akan disubmit
			lastSubmittedStorage.current = submissionData.storage_number;
			addReading(submissionData);
		};

		if (
			lastSubmittedStorage.current &&
			formData.storageNumber !== lastSubmittedStorage.current
		) {
			// Simpan aksi submit untuk dijalankan setelah konfirmasi
			setConfirmAction(() => processAndSubmit);
			setIsConfirmDialogOpen(true);
		} else {
			processAndSubmit();
		}
	};

	return (
		<>
			<form
				onSubmit={handleSubmit}
				className="space-y-6">
				<div className="grid gap-6">
					<div className="space-y-3">
						<Label
							htmlFor="storage"
							className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<Database className="h-4 w-4 text-blue-600" />
							Storage <span className="text-red-500">*</span>
						</Label>
						<Select
							value={formData.storageNumber}
							onValueChange={handleStorageChange}
							disabled={isLoadingStorages}>
							<SelectTrigger className="h-12">
								<SelectValue placeholder="Pilih nomor storage..." />
							</SelectTrigger>
							<SelectContent>
								{storages.map((storage) => (
									<SelectItem
										key={storage.storage_number}
										value={storage.storage_number}>
										<div className="flex items-center justify-between w-full">
											<div className="flex items-center gap-2">
												{storage.type === "fixed" ? (
													<Building className="h-4 w-4 text-indigo-600" />
												) : (
													<Truck className="h-4 w-4 text-green-600" />
												)}
												<span>
													{storage.storage_number}
												</span>
											</div>
											<span className="text-xs text-gray-500 capitalize">
												{storage.type}
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-3">
						<Label
							htmlFor="recordingTime"
							className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<Clock className="h-4 w-4 text-purple-600" />
							Jam Pencatatan Aktual{" "}
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
							className="h-12 text-base"
							required
						/>
						<p className="text-xs text-gray-500">
							Waktu akan dibulatkan otomatis oleh sistem.
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
								className="h-12 text-base border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-cyan-300 focus:border-cyan-500 transition-all duration-200"
							/>
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
						className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
						disabled={isSubmitting}>
						<Save className="h-5 w-5 mr-2" />
						{isSubmitting ? "Menyimpan..." : "Simpan Data"}
					</Button>
				</div>
			</form>

			<AlertDialog
				open={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Konfirmasi Perubahan Storage
						</AlertDialogTitle>
						<AlertDialogDescription>
							Anda mengubah nomor storage dari{" "}
							<span className="font-bold">
								{lastSubmittedStorage.current}
							</span>{" "}
							ke{" "}
							<span className="font-bold">
								{formData.storageNumber}
							</span>
							. Ini akan memulai sesi pencatatan baru untuk
							storage ini. Apakah Anda yakin?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								confirmAction?.();
							}}>
							Ya, Lanjutkan
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
