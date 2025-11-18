import { ShieldAlert, Send, AlertTriangle } from "lucide-react";
import { customToast } from "./CustomToast";
import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";

export function TransferOverrideForm() {
	const [showConfirm, setShowConfirm] = useState(false);
	const [formData, setFormData] = useState({
		clientName: "",
		transferType: "",
		amount: "",
		destination: "",
		reason: "",
		approvalCode: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setShowConfirm(true);
	};

	const handleConfirm = () => {
		customToast.success({
			title: "Transfer Submitted",
			description: "Transfer override request submitted for review",
		});
		setFormData({
			clientName: "",
			transferType: "",
			amount: "",
			destination: "",
			reason: "",
			approvalCode: "",
		});
		setShowConfirm(false);
	};

	return (
		<div className="h-full">
			<ScrollArea className="h-full overflow-auto">
				<div className="max-w-3xl mx-auto p-3 lg:p-0 pb-safe">
					<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-6">
							<div className="p-2 lg:p-3 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-300 dark:border-orange-900 shrink-0">
								<ShieldAlert className="size-5 lg:size-6 text-orange-600 dark:text-orange-400" />
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="mb-1">Transfer Override Request</h3>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">
									Secure manual execution for urgent transfers requiring special
									authorization
								</p>
							</div>
							<Badge
								variant="outline"
								className="border-orange-500 dark:border-orange-700 text-orange-600 dark:text-orange-400 shrink-0 hidden sm:flex">
								Requires Approval
							</Badge>
						</div>

						{/* Warning Banner */}
						<div className="mb-4 lg:mb-6 p-3 lg:p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 flex gap-3">
							<AlertTriangle className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
							<div className="min-w-0">
								<p className="text-sm mb-1">Security Notice</p>
								<p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
									All override requests are logged and require senior management
									approval. Ensure all information is accurate and justified before
									submission.
								</p>
							</div>
						</div>

						<form
							onSubmit={handleSubmit}
							className="space-y-4 lg:space-y-6">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="clientName">Client Name</Label>
									<Input
										id="clientName"
										value={formData.clientName}
										onChange={(e) =>
											setFormData({ ...formData, clientName: e.target.value })
										}
										placeholder="Select or enter client name"
										className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="transferType">Transfer Type</Label>
									<Select
										value={formData.transferType}
										onValueChange={(value) =>
											setFormData({ ...formData, transferType: value })
										}
										required>
										<SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
											<SelectItem value="local">Local Bank Transfer</SelectItem>
											<SelectItem value="wire">Wire Transfer</SelectItem>
											<SelectItem value="ach">ACH Transfer</SelectItem>
											<SelectItem value="international">International Transfer</SelectItem>
											<SelectItem value="crypto">Cryptocurrency Transfer</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="amount">Transfer Amount</Label>
									<Input
										id="amount"
										type="text"
										value={formData.amount}
										onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
										placeholder="₦0"
										className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="destination">Destination Account</Label>
									<Input
										id="destination"
										value={formData.destination}
										onChange={(e) =>
											setFormData({ ...formData, destination: e.target.value })
										}
										placeholder="Account number or address"
										className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="reason">Justification & Reason</Label>
								<Textarea
									id="reason"
									value={formData.reason}
									onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
									placeholder="Provide detailed explanation for override request..."
									className="min-h-[120px] bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="approvalCode">Senior Management Approval Code</Label>
								<Input
									id="approvalCode"
									type="password"
									value={formData.approvalCode}
									onChange={(e) =>
										setFormData({ ...formData, approvalCode: e.target.value })
									}
									placeholder="Enter 6-digit authorization code"
									className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
									maxLength={6}
									required
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<Button
									type="button"
									variant="outline"
									className="flex-1 border-zinc-300 dark:border-zinc-700"
									onClick={() =>
										setFormData({
											clientName: "",
											transferType: "",
											amount: "",
											destination: "",
											reason: "",
											approvalCode: "",
										})
									}>
									Clear Form
								</Button>
								<Button
									type="submit"
									className="flex-1 bg-orange-600 hover:bg-orange-700">
									<Send className="size-4 mr-2" />
									Submit Override Request
								</Button>
							</div>
						</form>
					</Card>
				</div>
			</ScrollArea>

			<AlertDialog
				open={showConfirm}
				onOpenChange={setShowConfirm}>
				<AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<ShieldAlert className="size-5 text-orange-500" />
							Confirm Transfer Override
						</AlertDialogTitle>
						<AlertDialogDescription className="text-zinc-600 dark:text-zinc-400">
							You are about to submit a high-security override request. This action
							will be logged and audited. Please verify all details are correct before
							proceeding.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="my-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-zinc-600 dark:text-zinc-400">Client:</span>
							<span>{formData.clientName}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-zinc-600 dark:text-zinc-400">Amount:</span>
							<span>{formData.amount}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-zinc-600 dark:text-zinc-400">Type:</span>
							<span>{formData.transferType}</span>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel className="border-zinc-300 dark:border-zinc-700">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							className="bg-orange-600 hover:bg-orange-700">
							Confirm & Submit
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
