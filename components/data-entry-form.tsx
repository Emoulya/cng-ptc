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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase-client";

interface Storage {
	storage_number: string;
}

interface DataEntryFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

export function DataEntryForm({ customerCode, onSuccess }: DataEntryFormProps) {
	const { addReading } = useData();
	const { user } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [storages, setStorages] = useState<Storage[]>([]);
	const [isLoadingStorages, setIsLoadingStorages] = useState(true);

	const [formData, setFormData] = useState({
		fixedStorageQuantity: "",
		storage: "",
		psi: "",
		temp: "",
		psiOut: "",
		flowTurbine: "",
		remarks: "",
	});

	useEffect(() => {
		const fetchStorages = async () => {
			setIsLoadingStorages(true);
			const { data, error } = await supabase
				.from("storages")
				.select("storage_number")
				.order("storage_number", { ascending: true });

			if (error) {
				console.error("Error fetching storages:", error);
				toast.error("Gagal memuat daftar storage");
			} else {
				setStorages(data);
			}
			setIsLoadingStorages(false);
		};
		fetchStorages();
	}, []);

	const currentTime = new Date().toLocaleString("id-ID", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("Authentication Error", {
				description: "User not found. Please log in again.",
			});
			return;
		}
		if (
			!formData.fixedStorageQuantity ||
			!formData.storage ||
			!formData.psi ||
			!formData.temp ||
			!formData.psiOut ||
			!formData.flowTurbine
		) {
			toast.error("Validation Error", {
				description: "Please fill in all required fields",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await addReading({
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
			});
			toast.success("Data Saved", {
				description: `Gas storage data for ${customerCode} has been recorded successfully`,
			});
			setFormData({
				fixedStorageQuantity: "",
				storage: "",
				psi: "",
				temp: "",
				psiOut: "",
				flowTurbine: "",
				remarks: "",
			});
			onSuccess?.();
		} catch (error: any) {
			toast.error("Error Saving Data", {
				description:
					error.message || "Failed to save data. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4">
			<Card className="bg-green-50 border-green-200">
				<CardContent className="pt-4">
					<div className="text-center">
						<p className="text-sm text-green-700 font-medium">
							Recording Time
						</p>
						<p className="text-lg font-mono font-bold text-green-800">
							{currentTime}
						</p>
						<p className="text-xs text-green-600">
							WIB (Auto-generated)
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-2">
				<Label
					htmlFor="fixedStorageQuantity"
					className="text-sm font-medium">
					Fixed Storage Quantity{" "}
					<span className="text-red-500">*</span>
				</Label>
				<Select
					value={formData.fixedStorageQuantity}
					onValueChange={(value) =>
						handleInputChange("fixedStorageQuantity", value)
					}>
					<SelectTrigger>
						<SelectValue placeholder="Select quantity..." />
					</SelectTrigger>
					<SelectContent>
						{[1, 2, 3, 4, 5].map((num) => (
							<SelectItem
								key={num}
								value={num.toString()}>
								{num}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="storage"
					className="text-sm font-medium">
					Storage <span className="text-red-500">*</span>
				</Label>
				<Select
					value={formData.storage}
					onValueChange={(value) =>
						handleInputChange("storage", value)
					}
					disabled={isLoadingStorages}>
					<SelectTrigger>
						<SelectValue
							placeholder={
								isLoadingStorages
									? "Memuat storage..."
									: "Pilih nomor storage..."
							}
						/>
					</SelectTrigger>
					<SelectContent className="max-h-60">
						{storages.map((storage) => (
							<SelectItem
								key={storage.storage_number}
								value={storage.storage_number}>
								{storage.storage_number}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="psi"
					className="text-sm font-medium">
					PSI <span className="text-red-500">*</span>
				</Label>
				<Input
					id="psi"
					type="number"
					step="0.1"
					placeholder="Enter PSI value"
					value={formData.psi}
					onChange={(e) => handleInputChange("psi", e.target.value)}
					className="text-base"
				/>
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="temp"
					className="text-sm font-medium">
					Temperature (°C) <span className="text-red-500">*</span>
				</Label>
				<Input
					id="temp"
					type="number"
					step="0.1"
					placeholder="Enter temperature"
					value={formData.temp}
					onChange={(e) => handleInputChange("temp", e.target.value)}
					className="text-base"
				/>
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="psiOut"
					className="text-sm font-medium">
					PSI Out <span className="text-red-500">*</span>
				</Label>
				<Input
					id="psiOut"
					type="number"
					step="0.1"
					placeholder="Enter PSI Out value"
					value={formData.psiOut}
					onChange={(e) =>
						handleInputChange("psiOut", e.target.value)
					}
					className="text-base"
				/>
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="flowTurbine"
					className="text-sm font-medium">
					Flow/Turbine <span className="text-red-500">*</span>
				</Label>
				<Input
					id="flowTurbine"
					type="number"
					step="0.1"
					placeholder="Enter flow/turbine value"
					value={formData.flowTurbine}
					onChange={(e) =>
						handleInputChange("flowTurbine", e.target.value)
					}
					className="text-base"
				/>
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="remarks"
					className="text-sm font-medium">
					Remarks
				</Label>
				<Textarea
					id="remarks"
					placeholder="Enter any remarks or observations..."
					value={formData.remarks}
					onChange={(e) =>
						handleInputChange("remarks", e.target.value)
					}
					className="text-base min-h-[80px]"
				/>
			</div>

			<Button
				type="submit"
				className="w-full h-12 text-base"
				disabled={isSubmitting}>
				{isSubmitting ? "Saving Data..." : "Save Gas Storage Data"}
			</Button>
		</form>
	);
}
