import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import {
	Wallet as WalletIcon,
	ArrowDownLeft,
	TrendingUp,
	Send,
	Download,
	RefreshCw,
	Eye,
	EyeOff,
	Plus,
	Receipt,
} from "lucide-react";
import { cn } from "../utils";
import { customToast } from "./CustomToast";

interface WalletProps {
	userId?: string;
}

import { useParams } from "react-router-dom";

export function Wallet() {
	const { userId } = useParams();
	const { wallet, getMyWallet, getUserWallet, initiateTransfer, loading } =
		useWallet();
	const [balanceVisible, setBalanceVisible] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
	const [addMethodDialogOpen, setAddMethodDialogOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [narration, setNarration] = useState("");
	const [securityAnswer, setSecurityAnswer] = useState("");
	const [withdrawing, setWithdrawing] = useState(false);

	useEffect(() => {
		if (userId) {
			getUserWallet(userId);
		} else {
			getMyWallet();
		}
	}, [getMyWallet, getUserWallet, userId]);

	const totalBalance = parseFloat(wallet?.balance || "0");

	const formatCurrency = (amount: number | string) => {
		const num = typeof amount === "string" ? parseFloat(amount) : amount;
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(num || 0);
	};

	const handleWithdraw = async () => {
		if (!amount || parseFloat(amount) <= 0) {
			customToast.error("Please enter a valid amount");
			return;
		}
		if (!securityAnswer) {
			customToast.error("Security answer is required");
			return;
		}

		setWithdrawing(true);
		try {
			await initiateTransfer({
				amount: parseFloat(amount),
				narration,
				securityAnswer,
				userIdentifier: userId || wallet?.userId,
			});
			customToast.success({
				title: "Withdrawal Initiated",
				description: "Your withdrawal request is being processed",
			});
			setWithdrawDialogOpen(false);
			setAmount("");
			setNarration("");
			setSecurityAnswer("");
			getMyWallet();
		} catch (err: any) {
			const msg =
				err.response?.data?.error?.message || "Failed to initiate transfer";
			customToast.error(msg);
		} finally {
			setWithdrawing(false);
		}
	};

	const handleAddPaymentMethod = () => {
		customToast.success({
			title: "Payment Method Added",
			description: "Your new payment method has been added successfully",
		});
		setAddMethodDialogOpen(false);
	};

	return (
		<div className="h-full flex flex-col overflow-auto font-sans bg-white dark:bg-zinc-900 px-4 lg:px-6 py-6">
			{/* Header */}
			<div className="shrink-0 pb-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-2xl mb-1 font-bold">Wallet</h2>
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
					<Card className="p-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white border-0 shadow-xl shadow-violet-500/20 relative overflow-hidden group">
						<div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
							<WalletIcon className="size-24" />
						</div>
						<div className="relative z-10">
							<div className="flex items-start justify-between mb-6">
								<div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
									<WalletIcon className="size-6" />
								</div>
								<Badge className="bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-md px-3 py-1">
									Available Funds
								</Badge>
							</div>
							<div>
								<p className="text-sm text-violet-100/80 mb-1 font-medium tracking-wide uppercase">
									Total Balance
								</p>
								<p className="text-4xl mb-2 font-black tracking-tight">
									{balanceVisible ? formatCurrency(totalBalance) : "₦ ••••••"}
								</p>
								<div className="flex items-center gap-2 text-xs text-violet-100/60 bg-black/10 w-fit px-2 py-1 rounded-full">
									<RefreshCw className="size-3" />
									<span>Updated just now</span>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-green-500/30 transition-all">
						<div className="flex items-start justify-between mb-6">
							<div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
								<TrendingUp className="size-6 text-green-600 dark:text-green-400" />
							</div>
							<Badge
								variant="secondary"
								className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-0">
								Live
							</Badge>
						</div>
						<div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 font-medium uppercase tracking-wider">
								Account Status
							</p>
							<p className="text-2xl text-zinc-900 dark:text-zinc-100 font-black uppercase tracking-tighter">
								{wallet?.status || "PENDING"}
							</p>
						</div>
					</Card>

					<Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-orange-500/30 transition-all">
						<div className="flex items-start justify-between mb-6">
							<div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
								<ArrowDownLeft className="size-6 text-orange-600 dark:text-orange-400" />
							</div>
							<Badge
								variant="secondary"
								className="bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0">
								Virtual
							</Badge>
						</div>
						<div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 font-medium uppercase tracking-wider">
								{wallet?.virtualAccount?.bankName || "No virtual account"}
							</p>
							<p className="text-2xl text-zinc-900 dark:text-zinc-100 font-black tracking-tighter">
								{wallet?.virtualAccount?.accountNumber || "N/A"}
							</p>
						</div>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
					<Dialog
						open={withdrawDialogOpen}
						onOpenChange={setWithdrawDialogOpen}>
						<DialogTrigger asChild>
							<Button className="h-12 gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-500/10 rounded-xl transition-all hover:scale-[1.02] active:scale-95">
								<Send className="size-4" />
								<span className="font-semibold">Withdraw</span>
							</Button>
						</DialogTrigger>
						<DialogContent className="font-sans border-none shadow-2xl rounded-3xl p-6 bg-white dark:bg-zinc-900">
							<DialogHeader className="mb-6">
								<DialogTitle className="text-2xl font-black tracking-tight">
									Withdraw Funds
								</DialogTitle>
								<DialogDescription className="text-zinc-500">
									Premium transfer to your verified account
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="amount"
										className="text-xs font-bold uppercase tracking-widest text-zinc-400">
										Amount (NGN)
									</Label>
									<Input
										id="amount"
										type="number"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										placeholder="0.00"
										className="h-14 text-xl font-bold bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-2xl"
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="narration"
										className="text-xs font-bold uppercase tracking-widest text-zinc-400">
										Narration (Optional)
									</Label>
									<Input
										id="narration"
										value={narration}
										onChange={(e) => setNarration(e.target.value)}
										placeholder="What's this for?"
										className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="securityAnswer"
										className="text-xs font-bold uppercase tracking-widest text-zinc-400">
										Security Secret Answer
									</Label>
									<Input
										id="securityAnswer"
										type="password"
										value={securityAnswer}
										onChange={(e) => setSecurityAnswer(e.target.value)}
										placeholder="Your secret answer"
										className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl font-mono"
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="account"
										className="text-xs font-bold uppercase tracking-widest text-zinc-400">
										Destination Account
									</Label>
									<Select>
										<SelectTrigger
											id="account"
											className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-2xl">
											<SelectValue placeholder="Select account" />
										</SelectTrigger>
										<SelectContent className="font-sans rounded-2xl border-none shadow-xl">
											<SelectItem value="primary">
												{wallet?.virtualAccount?.bankName || "Primary Account"} (••
												{wallet?.virtualAccount?.accountNumber?.slice(-4) || "••••"})
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Button
									onClick={handleWithdraw}
									disabled={withdrawing}
									className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-95">
									{withdrawing ? "Processing..." : "Initiate Transfer"}
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<Button
						variant="outline"
						className="h-12 gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all hover:scale-[1.02] active:scale-95 font-semibold">
						<Download className="size-4" />
						Export
					</Button>

					<Button
						variant="outline"
						className="h-12 gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all hover:scale-[1.02] active:scale-95 font-semibold"
						onClick={() => getMyWallet()}>
						<RefreshCw className={cn("size-4", loading && "animate-spin")} />
						Refresh
					</Button>

					<Dialog
						open={addMethodDialogOpen}
						onOpenChange={setAddMethodDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								className="h-12 gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all hover:scale-[1.02] active:scale-95 font-semibold text-violet-600 dark:text-violet-400">
								<Plus className="size-4" />
								Add Method
							</Button>
						</DialogTrigger>
						<DialogContent className="font-sans border-none shadow-2xl rounded-3xl p-6 bg-white dark:bg-zinc-900">
							<DialogHeader className="mb-6">
								<DialogTitle className="text-2xl font-black tracking-tight">
									Payment Method
								</DialogTitle>
								<DialogDescription className="text-zinc-500">
									Securely link a new bank account
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-5">
								<div className="space-y-2">
									<Label
										htmlFor="method-type"
										className="text-xs font-bold uppercase tracking-widest text-zinc-400">
										Type
									</Label>
									<Select>
										<SelectTrigger
											id="method-type"
											className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent className="font-sans rounded-xl border-none shadow-xl">
											<SelectItem value="bank">Bank Account</SelectItem>
											<SelectItem value="card">Debit Card</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="account-number"
										className="text-xs font-bold uppercase tracking-widest text-zinc-400">
										Account Number
									</Label>
									<Input
										id="account-number"
										type="text"
										placeholder="0000000000"
										className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl"
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="bank-name"
										className="text-xs font-bold uppercase tracking-widest text-zinc-400">
										Bank Name
									</Label>
									<Input
										id="bank-name"
										type="text"
										placeholder="e.g. Zenith Bank"
										className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl"
									/>
								</div>
								<Button
									onClick={handleAddPaymentMethod}
									className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 mt-2">
									Save Method
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Content Tabs - Scrollable on Mobile */}
			<div className="flex-1 flex flex-col overflow-hidden min-h-0 mt-8">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex-1 flex flex-col overflow-hidden min-h-0">
					<TabsList className="w-fit mb-6 px-1 h-12 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800">
						<TabsTrigger
							value="overview"
							className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 rounded-xl px-6 h-10 transition-all font-semibold">
							Overview
						</TabsTrigger>
						<TabsTrigger
							value="transactions"
							className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 rounded-xl px-6 h-10 transition-all font-semibold">
							Transactions
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="overview"
						className="flex-1 overflow-y-auto data-[state=inactive]:hidden px-1">
						<div className="space-y-6 pb-8">
							{/* Recent Activity Placeholder */}
							<Card className="p-16 text-center shadow-none border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-3xl">
								<Receipt className="size-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700 opacity-50" />
								<p className="text-zinc-500 dark:text-zinc-400 font-bold mb-1">
									Clean Slate
								</p>
								<p className="text-zinc-400 dark:text-zinc-500 text-sm italic">
									Your recent activity will manifest here
								</p>
							</Card>

							{/* Monthly Summary Placeholder */}
							<Card className="p-6 shadow-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden relative group transition-all hover:shadow-2xl hover:shadow-zinc-500/5">
								<div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
								<h3 className="text-lg mb-6 font-black tracking-tight">
									Account Summary
								</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 rounded-2xl bg-violet-50 dark:bg-zinc-800 border border-violet-100 dark:border-zinc-700">
										<div className="flex items-center gap-4">
											<div className="p-2.5 rounded-xl bg-violet-100 dark:bg-zinc-700">
												<TrendingUp className="size-5 text-violet-600 dark:text-violet-400" />
											</div>
											<span className="text-sm font-bold tracking-tight">
												Current Portfolio
											</span>
										</div>
										<span className="text-xl font-black text-violet-600 dark:text-violet-400">
											{formatCurrency(totalBalance)}
										</span>
									</div>
								</div>
							</Card>
						</div>
					</TabsContent>

					<TabsContent
						value="transactions"
						className="flex-1 overflow-y-auto data-[state=inactive]:hidden px-1">
						<div className="space-y-4 pb-8">
							<Card className="p-20 text-center shadow-none border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-3xl">
								<RefreshCw className="size-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700 opacity-50" />
								<p className="text-zinc-400 font-bold italic">
									Waiting for your first transaction...
								</p>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
