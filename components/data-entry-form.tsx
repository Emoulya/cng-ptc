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
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/hooks/use-auth";

// Asumsi Anda akan mengisi data ini dari database nantinya
const STORAGE_NUMBERS = [
	"1001",
	"1002",
	"1004",
	"1005",
	"1007",
	"1008",
	"1010",
	"1011",
	"1012",
	"1013",
	"1014",
	"1015",
	"1016",
	"1017",
	"1018",
	"1019",
	"1020",
	"1021",
	"2001",
	"2002",
	"2003",
	"2004",
	"3001",
	"3002",
	"3003",
	"3004",
	"107",
	"108",
	"109",
	"110",
	"111",
	"112",
	"113",
	"115",
	"118",
	"119",
	"201",
	"203",
	"303",
	"304",
	"305",
	"306",
	"307",
	"308",
	"401",
	"402",
	"403",
	"404",
	"405",
	"501",
	"502",
	"503",
	"504",
	"505",
	"506",
	"507",
	"508",
	"509",
	"510",
	"511",
	"512",
	"KR01",
	"MX01",
	"MX02",
	"EK01",
	"EK02",
	"EK03",
	"EK04",
];

interface DataEntryFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

export function DataEntryForm({ customerCode, onSuccess }: DataEntryFormProps) {
	const { addReading } = useData();
	const { user } = useAuth(); // Kita butuh user.id
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		fixedStorageQuantity: "",
		storage: "",
		psi: "",
		temp: "",
		psiOut: "",
		flowTurbine: "",
		remarks: "",
	});

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
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			toast.error("Authentication Error", {
				description: "User not found. Please log in again.",
			});
			return;
		}

		// Validasi
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
				operator_id: user.id, // Menggunakan ID pengguna yang sedang login
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

			// Reset form
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
			{/* Sisanya sama persis, tidak perlu diubah */}
			{/* ... (Card, Input fields, Button, etc.) ... */}
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

			{/* Fixed Storage Quantity */}
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

			{/* Storage */}
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
					}>
					<SelectTrigger>
						<SelectValue placeholder="Select storage number..." />
					</SelectTrigger>
					<SelectContent className="max-h-60">
						{STORAGE_NUMBERS.map((storage) => (
							<SelectItem
								key={storage}
								value={storage}>
								{storage}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* PSI */}
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

			{/* Temperature */}
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

			{/* PSI Out */}
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

			{/* Flow/Turbine */}
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

			{/* Remarks */}
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

			{/* Submit Button */}
			<Button
				type="submit"
				className="w-full h-12 text-base"
				disabled={isSubmitting}>
				{isSubmitting ? "Saving Data..." : "Save Gas Storage Data"}
			</Button>
		</form>
	);
}
