"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase-client";
import type {
	AuthChangeEvent,
	Session,
	User as SupabaseUser,
} from "@supabase/supabase-js";

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
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		// Fungsi untuk mengambil profil pengguna dari tabel 'profiles'
		const getProfile = async (supabaseUser: SupabaseUser) => {
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
		};

		// Cek sesi yang aktif saat pertama kali load
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			if (session) {
				const profile = await getProfile(session.user);
				setUser(profile);
			}
			setIsLoading(false);
		});

		// Dengarkan perubahan status otentikasi (SIGNED_IN, SIGNED_OUT)
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event: AuthChangeEvent, session: Session | null) => {
				if (session) {
					const profile = await getProfile(session.user);
					setUser(profile);
				} else {
					setUser(null);
				}
				setIsLoading(false);
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	const login = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
		// State akan diupdate otomatis oleh onAuthStateChange
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setUser(null);
		// State akan diupdate otomatis oleh onAuthStateChange
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
