"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
	useCallback,
} from "react";
import { supabase } from "@/lib/supabase-client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Definisikan tipe User baru yang menyertakan role
export interface UserProfile {
	id: string;
	username: string;
	role: "operator" | "admin" | "super_admin";
}

interface AuthContextType {
	user: UserProfile | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	// Inisialisasi isLoading ke true untuk menampilkan loader pada saat awal
	const [isLoading, setIsLoading] = useState(true);

	const getProfile = useCallback(
		async (supabaseUser: SupabaseUser | null) => {
			if (!supabaseUser) {
				return null;
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("id, username, role")
				.eq("id", supabaseUser.id)
				.single();

			if (error) {
				console.error("Error fetching profile:", error);
				return null;
			}
			return data as UserProfile;
		},
		[]
	);

	useEffect(() => {
		// Fungsi ini sekarang memiliki penanganan error yang kuat
		const checkSessionAndSetUser = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (session) {
					const profile = await getProfile(session.user);
					setUser(profile);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error("Error during session check:", error);
				setUser(null); // Jika error, pastikan user dianggap logout
			} finally {
				setIsLoading(false);
			}
		};

		// Jalankan pengecekan saat provider pertama kali dimuat
		checkSessionAndSetUser();

		// Siapkan listener untuk perubahan status auth berikutnya (login/logout)
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				// Ketika status auth berubah, cukup update profil user
				getProfile(session?.user ?? null).then((profile) => {
					setUser(profile);
				});
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [getProfile]);

	const login = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;

		if (data.user) {
			const profile = await getProfile(data.user);
			setUser(profile);
		}
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setUser(null);
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
