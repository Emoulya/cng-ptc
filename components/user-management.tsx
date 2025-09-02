// cng-ptc/components/user-management.tsx
"use client";

import { useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, Loader2, Users } from "lucide-react";
import {
	useProfiles,
	useAddProfile,
	useDeleteProfile,
} from "@/hooks/use-profiles";
import type { NewProfileData } from "@/types/data";

export function UserManagement() {
	const { data: profiles = [], isLoading } = useProfiles();
	const { mutate: addProfile, isPending: isSubmitting } = useAddProfile();
	const { mutate: deleteProfile } = useDeleteProfile();

	const [formData, setFormData] = useState<NewProfileData>({
		username: "",
		email: "",
		password: "",
		role: "operator",
	});

	const handleInputChange = (field: keyof NewProfileData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		addProfile(formData, {
			onSuccess: () => {
				setFormData({
					username: "",
					email: "",
					password: "",
					role: "operator",
				});
			},
		});
	};

	const handleDelete = (id: string, username: string) => {
		deleteProfile(id);
	};

	return (
		<div className="grid md:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Tambah Akun Baru</CardTitle>
					<CardDescription>
						Buat akun baru untuk admin atau operator.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								value={formData.username}
								onChange={(e) =>
									handleInputChange(
										"username",
										e.target.value
									)
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									handleInputChange("email", e.target.value)
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={formData.password}
								onChange={(e) =>
									handleInputChange(
										"password",
										e.target.value
									)
								}
								required
								minLength={8}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Peran (Role)</Label>
							<Select
								value={formData.role}
								onValueChange={(value: "operator" | "admin") =>
									handleInputChange("role", value)
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="operator">
										Operator
									</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full">
							{isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : (
								<PlusCircle className="mr-2" />
							)}
							Buat Akun
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Daftar Akun</CardTitle>
					<CardDescription>
						Total: {profiles.length} akun
					</CardDescription>
				</CardHeader>
				<CardContent className="h-96 overflow-y-auto">
					{isLoading ? (
						<Loader2 className="mx-auto animate-spin" />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Username</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{profiles.map((p) => (
									<TableRow key={p.id}>
										<TableCell className="font-bold">
											{p.username}
										</TableCell>
										<TableCell>{p.email}</TableCell>
										<TableCell>{p.role}</TableCell>
										<TableCell>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm">
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Apakah Anda yakin?
														</AlertDialogTitle>
														<AlertDialogDescription>
															Tindakan ini akan
															menghapus akun{" "}
															<strong>
																{p.username}
															</strong>{" "}
															secara permanen.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															Batal
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() =>
																handleDelete(
																	p.id,
																	p.username
																)
															}>
															Ya, Hapus
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
