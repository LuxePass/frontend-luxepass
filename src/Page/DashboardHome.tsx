import { MetricsCards } from "../Page/MetricsCards";
import { QuickViews } from "../Page/QuickViews";
import { useNavigate } from "react-router-dom";

export function DashboardHome() {
	const navigate = useNavigate();

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			<div className="px-3 lg:px-6 pt-3 lg:pt-4 shrink-0">
				<MetricsCards />
			</div>
			<div className="flex-1 flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 lg:p-6 overflow-hidden min-h-0">
				<div className="flex-1 flex flex-col overflow-hidden min-w-0">
					<div className="flex-1 overflow-hidden">
						<QuickViews
							onTasksClick={() => navigate("/tasks")}
							onChatClick={() => navigate("/livechat")}
							onTransferClick={() => navigate("/transfer")}
							onListingsClick={() => navigate("/listings")}
							onReferralsClick={() => navigate("/referrals")}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
