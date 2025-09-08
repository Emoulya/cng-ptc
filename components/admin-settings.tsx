// cng-ptc/components/admin-settings.tsx
"use client";

import { CustomerManagement } from "./customer-management";
import { StorageManagement } from "./storage-management";
import { UserManagement } from "./user-management";

export function AdminSettings() {
	return (
		<div className="space-y-8">
			{/* Bagian Manajemen Customer */}
			<CustomerManagement />

			{/* Bagian Manajemen Storage */}
			<StorageManagement />

			{/* Bagian Manajemen Akun Pengguna */}
			<UserManagement />
		</div>
	);
}
