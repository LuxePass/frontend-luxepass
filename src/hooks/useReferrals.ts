/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { customToast } from "../Page/CustomToast";

interface ReferralActivity {
	id: string;
	referrerId: string;
	referrerName: string;
	referredId: string;
	referredName: string;
	referredEmail: string;
	referredPhone: string;
	dateReferred: string;
	dateJoined: string | null;
	status: "pending" | "joined" | "active" | "inactive";
	rewardStatus: "pending" | "processing" | "paid" | "cancelled";
	rewardAmount: number;
	tierLevel: number;
	totalSpent: number;
	lifetimeValue: number;
}

interface ClientReferralStats {
	clientId: string;
	clientName: string;
	totalReferrals: number;
	successfulReferrals: number;
	pendingReferrals: number;
	totalRewardsEarned: number;
	pendingRewards: number;
	lifetimeValueGenerated: number;
	joinDate: string;
	referralTier: "bronze" | "silver" | "gold" | "platinum";
	conversionRate: number;
}

export function useReferrals() {
	const [activities, setActivities] = useState<ReferralActivity[]>([]);
	const [clientStats, setClientStats] = useState<ClientReferralStats[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchReferralData = useCallback(async () => {
		setLoading(true);
		try {
			const backendUrl =
				import.meta.env.VITE_WHATSAPP_BACKEND_URL ||
				"https://mysound-whatsapp-backend.onrender.com/api";
			const response = await fetch(`${backendUrl}/referrals/stats`);
			const data = await response.json();

			if (data.success) {
				// Transform Activities
				const newActivities: ReferralActivity[] = data.data.activities.map(
					(item: Record<string, any>, index: number) => ({
						id: item._id || `ref-${index}`,
						referrerId: item.referredBy,
						referrerName: item.referrerName || item.referredBy || "Unknown",
						referredId: item._id,
						referredName: item.name || "Unknown",
						referredEmail: item.email || "N/A",
						referredPhone: item.phoneNumber,
						dateReferred:
							item.createdAt ?
								new Date(item.createdAt).toISOString().split("T")[0]
							:	"N/A",
						dateJoined:
							item.createdAt ?
								new Date(item.createdAt).toISOString().split("T")[0]
							:	"N/A",
						status: "joined",
						rewardStatus: item.rewardsEarned > 0 ? "pending" : "paid",
						rewardAmount: item.rewardsEarned || 0,
						tierLevel: 1,
						totalSpent: 0,
						lifetimeValue: 0,
					}),
				);

				// Transform Client Stats (Top Referrers)
				const newClientStats: ClientReferralStats[] = data.data.topReferrers.map(
					(item: Record<string, any>) => ({
						clientId: item.referralCode,
						clientName: item.name || "Unknown",
						referralCode: item.referralCode,
						totalReferrals: item.count,
						successfulReferrals: item.count,
						pendingReferrals: 0,
						totalRewardsEarned: item.rewardsEarned || 0,
						pendingRewards: item.rewardsEarned || 0,
						lifetimeValueGenerated: 0,
						joinDate: "2025-01-01",
						referralTier: "bronze",
						conversionRate: 100,
					}),
				);

				setActivities(newActivities);
				setClientStats(newClientStats);
			}
		} catch (error) {
			console.error("Failed to fetch referral stats:", error);
			customToast.error({
				title: "Error",
				description: "Failed to load referral data",
			});
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		activities,
		clientStats,
		loading,
		fetchReferralData,
	};
}
