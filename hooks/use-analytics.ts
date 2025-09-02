// cng-ptc/hooks/use-analytics.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getOverallStats, getReadingsOverTime  } from "@/lib/api";

export const useAnalytics = () => {
	return useQuery({
		queryKey: ["analytics-stats"],
		queryFn: getOverallStats,
	});
};

export const useAnalyticsOverTime = (startDate: string, endDate: string) => {
	return useQuery({
		queryKey: ["analytics-over-time", startDate, endDate],
		queryFn: () => getReadingsOverTime(startDate, endDate),
		enabled: !!startDate && !!endDate, // Hanya aktif jika tanggal sudah dipilih
	});
};
