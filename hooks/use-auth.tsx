"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
	useCallback,
} from "react";

export interface UserProfile {
	id: string;
	username: string;
	role: "operator" | "admin" | "super_admin";
	email?: string;
}

interface AuthContextType {
	user: UserProfile | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function untuk mengambil token dari local storage
const getAuthToken = () => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("access_token");
};

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const getProfileFromToken = useCallback(async () => {
		const token = getAuthToken();
		if (!token) {
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const profile = await response.json();
				setUser(profile);
			} else {
				// Token tidak valid atau kedaluwarsa
				localStorage.removeItem("access_token");
				setUser(null);
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		getProfileFromToken();
	}, [getProfileFromToken]);

	const login = async (email: string, password: string) => {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Login failed");
		}

		const data = await response.json();
		localStorage.setItem("access_token", data.access_token);
		setUser(data.user);
	};

	const logout = async () => {
		const token = getAuthToken();
		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ accessToken: token }),
			});
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			// Selalu hapus token dan user state, bahkan jika request logout gagal
			localStorage.removeItem("access_token");
			setUser(null);
		}
	};

	const value = {
		user,
		isLoading,
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
