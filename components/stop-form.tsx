// cng-ptc/components/stop-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useAddStopReading, useProcessedReadingsByCustomer } from "@/hooks/use-readings";
import { Clock, Gauge, Wind, FileText, Save, Loader2, AlertTriangle, Thermometer } from "lucide-react";
import type { ReadingWithFlowMeter } from "@/types/data";

interface StopFormProps {
	customerCode: string;
	onSuccess?: () => void;
}

export function StopForm({ customerCode, onSuccess }: StopFormProps) {
	const { user } = useAuth();
    const [lastStorageNumber, setLastStorageNumber] = useState<string | null>(null);
    const [lastFixedQuantity, setLastFixedQuantity] = useState<number | null>(null);

    const { data: readings = [] } = useProcessedReadingsByCustomer(customerCode, 'week');

	const [formData, setFormData] = useState({
		recordingTime: "",
		psi: "",
        temp: "",
        psiOut: "",
		flowTurbine: "",
		remarks: "",
	});

    useEffect(() => {
        if (readings.length > 0) {
            const lastReading = readings
                .slice()
                .reverse()
                .find(
                    (r): r is ReadingWithFlowMeter => "storage_number" in r && !!r.storage_number
                );
            if (lastReading) {
                setLastStorageNumber(lastReading.storage_number);
                setLastFixedQuantity(lastReading.fixed_storage_quantity);
            }
        }
    }, [readings]);


	const { mutate: addStopReading, isPending: isSubmitting } = useAddStopReading({
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
		},
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("Authentication Error");
			return;
		}
        if (!lastStorageNumber) {
            toast.error("Error", {
                description: "Tidak dapat menemukan data sebelumnya untuk melanjutkan.",
            });
            return;
        }

		const requiredFields = ["recordingTime", "psi", "temp", "psiOut", "flowTurbine"];
		if (requiredFields.some((field) => !formData[field as keyof typeof formData])) {
			toast.error("Validation Error", {
				description: "Mohon isi semua field yang ditandai bintang (*)",
			});
			return;
		}

		addStopReading({
            customer_code: customerCode,
            storage_number: lastStorageNumber!,
            manual_created_at: formData.recordingTime,
            psi: parseFloat(formData.psi),
            temp: parseFloat(formData.temp),
            psi_out: parseFloat(formData.psiOut),
            flow_turbine: parseFloat(formData.flowTurbine),
            remarks: formData.remarks,
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
				<form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600">
                            Data STOP ini akan mengakhiri sesi laporan untuk storage:
                        </p>
                        <p className="font-bold text-lg text-gray-800">
                            {lastStorageNumber || "Tidak Ditemukan"}
                        </p>
                    </div>

					<div className="space-y-3">
						<Label htmlFor="recordingTime" className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<Clock className="h-4 w-4 text-purple-600" />
							Jam Pencatatan STOP <span className="text-red-500">*</span>
						</Label>
						<Input id="recordingTime" type="time" value={formData.recordingTime}
							onChange={(e) => handleInputChange("recordingTime", e.target.value)}
							className="h-12 text-base" required />
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-3">
							<Label htmlFor="psi" className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Gauge className="h-4 w-4 text-red-600" />
								Pressure (PSI) <span className="text-red-500">*</span>
							</Label>
							<Input id="psi" type="number" step="0.1" placeholder="0.0" value={formData.psi}
								onChange={(e) => handleInputChange("psi", e.target.value)}
								className="h-12 text-base" />
						</div>

						<div className="space-y-3">
							<Label htmlFor="temp" className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Thermometer className="h-4 w-4 text-orange-600" />
								Temperatur (°C) <span className="text-red-500">*</span>
							</Label>
							<Input id="temp" type="number" step="0.1" placeholder="0.0" value={formData.temp}
								onChange={(e) => handleInputChange("temp", e.target.value)}
								className="h-12 text-base" />
						</div>

						<div className="space-y-3">
							<Label htmlFor="psiOut" className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Gauge className="h-4 w-4 text-indigo-600" />
								P. Out (Bar) <span className="text-red-500">*</span>
							</Label>
							<Input id="psiOut" type="number" step="0.1" placeholder="0.0" value={formData.psiOut}
								onChange={(e) => handleInputChange("psiOut", e.target.value)}
								className="h-12 text-base" />
						</div>

						<div className="space-y-3">
							<Label htmlFor="flowTurbine" className="text-base font-semibold text-gray-700 flex items-center gap-2">
								<Wind className="h-4 w-4 text-cyan-600" />
								Flow/Turbin <span className="text-red-500">*</span>
							</Label>
							<Input id="flowTurbine" type="number" step="0.1" placeholder="0.0" value={formData.flowTurbine}
								onChange={(e) => handleInputChange("flowTurbine", e.target.value)}
								className="h-12 text-base" />
						</div>
					</div>

					<div className="space-y-3">
						<Label htmlFor="remarks" className="text-base font-semibold text-gray-700 flex items-center gap-2">
							<FileText className="h-4 w-4 text-gray-600" />
							Keterangan
						</Label>
						<Textarea id="remarks" placeholder="Masukkan keterangan atau observasi..." value={formData.remarks}
							onChange={(e) => handleInputChange("remarks", e.target.value)}
							className="text-base min-h-[100px]" />
					</div>

					<Button type="submit"
						className="w-full h-14 text-base font-semibold bg-gradient-to-r from-red-600 to-orange-700 hover:from-red-700 hover:to-orange-800 shadow-lg"
						disabled={isSubmitting || !lastStorageNumber}>
						<Save className="h-5 w-5 mr-2" />
						{isSubmitting ? "Menyimpan..." : "Simpan Data STOP"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}