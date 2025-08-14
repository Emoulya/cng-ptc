"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function AdminSettings() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Manajemen Akun Operator</CardTitle>
				<CardDescription>
					Buat akun baru untuk operator lapangan.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4 max-w-lg">
					<div className="space-y-2">
						<Label htmlFor="username">Username Operator</Label>
						<Input
							id="username"
							type="text"
							placeholder="Contoh: operator_lapangan_1"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password Sementara</Label>
						<Input
							id="password"
							type="password"
							placeholder="Buat password yang kuat"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Konfirmasi Password
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Ulangi password di atas"
						/>
					</div>
					<Button
						type="submit"
						className="flex items-center gap-2">
						<PlusCircle className="h-4 w-4" />
						Buat Akun Operator
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
