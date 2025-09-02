import React from "react";
import { LoginForm } from "@/components/login-form";

export default function HomePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-indigo-200">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						PTC Monitoring
					</h1>
					<p className="text-gray-600">
						Gas Storage Monitoring System
					</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
