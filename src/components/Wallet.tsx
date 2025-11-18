/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	Wallet as WalletIcon,
	ArrowUpRight,
	ArrowDownLeft,
	CreditCard,
	TrendingUp,
	DollarSign,
	Send,
	Download,
	RefreshCw,
	Eye,
	EyeOff,
	Plus,
	ChevronRight,
	Receipt,
} from "lucide-react";
import { cn } from "../utils";
import { customToast } from "./CustomToast";

interface Transaction {
	id: string;
	type: "credit" | "debit";
	amount: number;
	currency: string;
	description: string;
	date: string;
	status: "completed" | "pending" | "failed";
	category: string;
	recipient?: string;
}

interface PaymentMethod {
	id: string;
	type: "bank" | "card";
	name: string;
	last4: string;
	primary: boolean;
}

const mockTransactions: Transaction[] = [
	{
		id: "1",
		type: "credit",
		amount: 2500000,
		currency: "NGN",
		description: "Service payment - Chidinma Okonkwo",
		date: "2025-10-19 14:30",
		status: "completed",
		category: "Service Fee",
		recipient: "Chidinma Okonkwo",
	},
	{
		id: "2",
		type: "debit",
		amount: 450000,
		currency: "NGN",
		description: "Restaurant booking - Nok by Alara",
		date: "2025-10-19 11:20",
		status: "completed",
		category: "Dining",
		recipient: "Nok by Alara",
	},
	{
		id: "3",
		type: "credit",
		amount: 1800000,
		currency: "NGN",
		description: "Service payment - Emeka Adeleke",
		date: "2025-10-18 16:45",
		status: "completed",
		category: "Service Fee",
		recipient: "Emeka Adeleke",
	},
	{
		id: "4",
		type: "debit",
		amount: 85000,
		currency: "NGN",
		description: "Art gallery booking - Nike Art Centre",
		date: "2025-10-18 09:15",
		status: "pending",
		category: "Events",
		recipient: "Nike Art Centre",
	},
	{
		id: "5",
		type: "credit",
		amount: 3200000,
		currency: "NGN",
		description: "Service payment - Amara Nwosu",
		date: "2025-10-17 14:00",
		status: "completed",
		category: "Service Fee",
		recipient: "Amara Nwosu",
	},
];

const mockPaymentMethods: PaymentMethod[] = [
	{
		id: "1",
		type: "bank",
		name: "GTBank - Naira Account",
		last4: "2847",
		primary: true,
	},
	{
		id: "2",
		type: "card",
		name: "Mastercard",
		last4: "4523",
		primary: false,
	},
	{
		id: "3",
		type: "bank",
		name: "Access Bank - Dollar Account",
		last4: "8932",
		primary: false,
	},
];

export function Wallet() {
	const [balanceVisible, setBalanceVisible] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
	const [addMethodDialogOpen, setAddMethodDialogOpen] = useState(false);

	const totalBalance = 8750000;
	const availableBalance = 8250000;
	const pendingBalance = 500000;
	const monthlyRevenue = 12450000;
	const monthlyExpenses = 3200000;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const handleWithdraw = () => {
		customToast.success({
			title: "Withdrawal Initiated",
			description: "Your withdrawal request is being processed",
		});
		setWithdrawDialogOpen(false);
	};

	const handleAddPaymentMethod = () => {
		customToast.success({
			title: "Payment Method Added",
			description: "Your new payment method has been added successfully",
		});
		setAddMethodDialogOpen(false);
	};

	return (
		<div className="h-full flex flex-col overflow-auto">
			{/* Header */}
			<div className="shrink-0 pb-4 px-4 lg:px-0">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-2xl mb-1">Wallet</h2>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							Manage your finances and transactions
						</p>
					</div>
					<Button
						onClick={() => setBalanceVisible(!balanceVisible)}
						variant="outline"
						size="sm"
						className="gap-2">
						{balanceVisible ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
						{balanceVisible ? "Hide" : "Show"}
					</Button>
				</div>

				{/* Balance Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="p-4 bg-gradient-to-br from-violet-600 to-purple-600 text-white border-0">
						<div className="flex items-start justify-between mb-3">
							<div className="p-2 rounded-lg bg-white/20">
								<WalletIcon className="size-5" />
							</div>
							<Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
								Total Balance
							</Badge>
						</div>
						<div>
							<p className="text-3xl mb-1">
								{balanceVisible ? formatCurrency(totalBalance) : "₦ ••••••"}
							</p>
							<p className="text-sm text-violet-100">Available for withdrawal</p>
						</div>
					</Card>

					<Card className="p-4">
						<div className="flex items-start justify-between mb-3">
							<div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
								<TrendingUp className="size-5 text-green-600 dark:text-green-400" />
							</div>
							<Badge
								variant="secondary"
								className="bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-0">
								This Month
							</Badge>
						</div>
						<div>
							<p className="text-2xl mb-1 text-zinc-900 dark:text-zinc-100">
								{balanceVisible ? formatCurrency(monthlyRevenue) : "₦ ••••••"}
							</p>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">Total Revenue</p>
						</div>
					</Card>

					<Card className="p-4">
						<div className="flex items-start justify-between mb-3">
							<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
								<ArrowDownLeft className="size-5 text-orange-600 dark:text-orange-400" />
							</div>
							<Badge
								variant="secondary"
								className="bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border-0">
								Pending
							</Badge>
						</div>
						<div>
							<p className="text-2xl mb-1 text-zinc-900 dark:text-zinc-100">
								{balanceVisible ? formatCurrency(pendingBalance) : "₦ ••••••"}
							</p>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">In Processing</p>
						</div>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
					<Dialog
						open={withdrawDialogOpen}
						onOpenChange={setWithdrawDialogOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2 bg-violet-600 hover:bg-violet-700">
								<Send className="size-4" />
								Withdraw
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Withdraw Funds</DialogTitle>
								<DialogDescription>
									Transfer funds to your bank account
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label htmlFor="amount">Amount (NGN)</Label>
									<Input
										id="amount"
										type="number"
										placeholder="Enter amount"
										className="mt-1.5"
									/>
								</div>
								<div>
									<Label htmlFor="account">Bank Account</Label>
									<Select>
										<SelectTrigger
											id="account"
											className="mt-1.5">
											<SelectValue placeholder="Select account" />
										</SelectTrigger>
										<SelectContent>
											{mockPaymentMethods
												.filter((m) => m.type === "bank")
												.map((method) => (
													<SelectItem
														key={method.id}
														value={method.id}>
														{method.name} (••{method.last4})
													</SelectItem>
												))}
										</SelectContent>
									</Select>
								</div>
								<Button
									onClick={handleWithdraw}
									className="w-full">
									Confirm Withdrawal
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<Button
						variant="outline"
						className="gap-2">
						<Download className="size-4" />
						Export
					</Button>

					<Button
						variant="outline"
						className="gap-2">
						<RefreshCw className="size-4" />
						Refresh
					</Button>

					<Dialog
						open={addMethodDialogOpen}
						onOpenChange={setAddMethodDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								className="gap-2">
								<Plus className="size-4" />
								Add Method
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Payment Method</DialogTitle>
								<DialogDescription>Add a new bank account or card</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label htmlFor="method-type">Type</Label>
									<Select>
										<SelectTrigger
											id="method-type"
											className="mt-1.5">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="bank">Bank Account</SelectItem>
											<SelectItem value="card">Debit Card</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="account-number">Account Number</Label>
									<Input
										id="account-number"
										type="text"
										placeholder="Enter account number"
										className="mt-1.5"
									/>
								</div>
								<div>
									<Label htmlFor="bank-name">Bank Name</Label>
									<Input
										id="bank-name"
										type="text"
										placeholder="Enter bank name"
										className="mt-1.5"
									/>
								</div>
								<Button
									onClick={handleAddPaymentMethod}
									className="w-full">
									Add Payment Method
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Content Tabs - Scrollable on Mobile */}
			<div className="flex-1 flex flex-col overflow-hidden min-h-0 mt-4 lg:mt-4">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex-1 flex flex-col overflow-hidden min-h-0">
					<TabsList className="w-full justify-start shrink-0">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="transactions">Transactions</TabsTrigger>
						<TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
					</TabsList>

					<TabsContent
						value="overview"
						className="flex-1 overflow-y-auto mt-4 data-[state=inactive]:hidden">
						<div className="space-y-4 pr-4 pb-4">
							{/* Recent Transactions */}
							<Card className="p-4">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg">Recent Transactions</h3>
									<Button
										variant="ghost"
										size="sm"
										className="text-violet-600 dark:text-violet-400"
										onClick={() => setActiveTab("transactions")}>
										View All
										<ChevronRight className="size-4 ml-1" />
									</Button>
								</div>
								<div className="space-y-3">
									{mockTransactions.slice(0, 5).map((transaction) => (
										<div
											key={transaction.id}
											className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
											<div className="flex items-center gap-3">
												<div
													className={cn(
														"p-2 rounded-lg",
														transaction.type === "credit"
															? "bg-green-100 dark:bg-green-950"
															: "bg-orange-100 dark:bg-orange-950"
													)}>
													{transaction.type === "credit" ? (
														<ArrowDownLeft className="size-4 text-green-600 dark:text-green-400" />
													) : (
														<ArrowUpRight className="size-4 text-orange-600 dark:text-orange-400" />
													)}
												</div>
												<div>
													<p className="text-sm">{transaction.description}</p>
													<p className="text-xs text-zinc-500 dark:text-zinc-400">
														{transaction.date}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p
													className={cn(
														"text-sm",
														transaction.type === "credit"
															? "text-green-600 dark:text-green-400"
															: "text-orange-600 dark:text-orange-400"
													)}>
													{transaction.type === "credit" ? "+" : "-"}
													{formatCurrency(transaction.amount)}
												</p>
												<Badge
													variant="secondary"
													className={cn(
														"text-xs",
														transaction.status === "completed" &&
															"bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
														transaction.status === "pending" &&
															"bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
													)}>
													{transaction.status}
												</Badge>
											</div>
										</div>
									))}
								</div>
							</Card>

							{/* Monthly Summary */}
							<Card className="p-4">
								<h3 className="text-lg mb-4">Monthly Summary</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/50">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
												<TrendingUp className="size-4 text-green-600 dark:text-green-400" />
											</div>
											<span className="text-sm">Total Revenue</span>
										</div>
										<span className="text-green-600 dark:text-green-400">
											{formatCurrency(monthlyRevenue)}
										</span>
									</div>
									<div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/50">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
												<ArrowUpRight className="size-4 text-orange-600 dark:text-orange-400" />
											</div>
											<span className="text-sm">Total Expenses</span>
										</div>
										<span className="text-orange-600 dark:text-orange-400">
											{formatCurrency(monthlyExpenses)}
										</span>
									</div>
									<div className="flex items-center justify-between p-3 rounded-lg bg-violet-50 dark:bg-violet-950/50">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950">
												<DollarSign className="size-4 text-violet-600 dark:text-violet-400" />
											</div>
											<span className="text-sm">Net Profit</span>
										</div>
										<span className="text-violet-600 dark:text-violet-400">
											{formatCurrency(monthlyRevenue - monthlyExpenses)}
										</span>
									</div>
								</div>
							</Card>
						</div>
					</TabsContent>

					<TabsContent
						value="transactions"
						className="flex-1 overflow-y-auto mt-4 data-[state=inactive]:hidden">
						<div className="space-y-3 pr-4 pb-4">
							{mockTransactions.map((transaction) => (
								<Card
									key={transaction.id}
									className="p-4">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3 flex-1">
											<div
												className={cn(
													"p-2 rounded-lg shrink-0",
													transaction.type === "credit"
														? "bg-green-100 dark:bg-green-950"
														: "bg-orange-100 dark:bg-orange-950"
												)}>
												{transaction.type === "credit" ? (
													<ArrowDownLeft className="size-5 text-green-600 dark:text-green-400" />
												) : (
													<ArrowUpRight className="size-5 text-orange-600 dark:text-orange-400" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="mb-1">{transaction.description}</p>
												<div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
													<span className="flex items-center gap-1">
														<Receipt className="size-3" />
														{transaction.date}
													</span>
													<span>•</span>
													<Badge
														variant="secondary"
														className="text-xs">
														{transaction.category}
													</Badge>
													<span>•</span>
													<span>{transaction.recipient}</span>
												</div>
											</div>
										</div>
										<div className="text-right ml-4 shrink-0">
											<p
												className={cn(
													"mb-1",
													transaction.type === "credit"
														? "text-green-600 dark:text-green-400"
														: "text-orange-600 dark:text-orange-400"
												)}>
												{transaction.type === "credit" ? "+" : "-"}
												{formatCurrency(transaction.amount)}
											</p>
											<Badge
												variant="secondary"
												className={cn(
													"text-xs",
													transaction.status === "completed" &&
														"bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
													transaction.status === "pending" &&
														"bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
													transaction.status === "failed" &&
														"bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
												)}>
												{transaction.status}
											</Badge>
										</div>
									</div>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent
						value="payment-methods"
						className="flex-1 overflow-y-auto mt-4 data-[state=inactive]:hidden">
						<div className="space-y-3 pr-4 pb-4">
							{mockPaymentMethods.map((method) => (
								<Card
									key={method.id}
									className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="p-3 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
												<CreditCard className="size-5 text-white" />
											</div>
											<div>
												<p className="mb-1">{method.name}</p>
												<p className="text-sm text-zinc-500 dark:text-zinc-400">
													•••• •••• •••• {method.last4}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{method.primary && (
												<Badge className="bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border-0">
													Primary
												</Badge>
											)}
											<Button
												variant="outline"
												size="sm">
												Manage
											</Button>
										</div>
									</div>
								</Card>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
