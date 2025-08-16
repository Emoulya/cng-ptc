"use client";

// Ubah baris import ini
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login, user } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await login(email, password);
			toast.success("Login Successful", {
				description: "Redirecting to your dashboard...",
			});
		} catch (error: any) {
			toast.error("Login Failed", {
				description:
					error.message || "Please check your email and password.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Ganti `React.useEffect` menjadi `useEffect`
	useEffect(() => {
		if (user) {
			if (user.role === "operator") {
				router.push("/operator");
			} else if (user.role === "admin" || user.role === "super_admin") {
				router.push("/admin");
			}
		}
	}, [user, router]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
				<CardDescription>
					Enter your credentials to access the monitoring system
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}>
						{isLoading ? "Signing in..." : "Sign In"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
