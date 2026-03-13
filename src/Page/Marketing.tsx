import { useEffect, useState } from "react";
import api from "../services/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Megaphone, Send, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { customToast } from "./CustomToast";

interface Recipient {
	id: string;
	uniqueId: string;
	name: string | null;
	phone: string;
}

export function Marketing() {
	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const [loadingRecipients, setLoadingRecipients] = useState(true);
	const [tab, setTab] = useState<"direct" | "broadcast">("direct");

	// Direct
	const [directUserId, setDirectUserId] = useState("");
	const [directPhone, setDirectPhone] = useState("");
	const [directMessage, setDirectMessage] = useState("");
	const [directSending, setDirectSending] = useState(false);

	// Broadcast
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [broadcastMessage, setBroadcastMessage] = useState("");
	const [broadcastSending, setBroadcastSending] = useState(false);
	const [lastResult, setLastResult] = useState<{ sent: number; total: number } | null>(null);

	useEffect(() => {
		let cancelled = false;
		setLoadingRecipients(true);
		api
			.get("/marketing/recipients")
			.then((res) => {
				if (cancelled) return;
				const data = res.data?.data ?? res.data;
				setRecipients(Array.isArray(data) ? data : []);
			})
			.catch((err) => {
				if (cancelled) return;
				if (err?.response?.status === 403) setRecipients([]);
				else customToast.error(err?.response?.data?.error?.message ?? "Failed to load recipients");
			})
			.finally(() => {
				if (!cancelled) setLoadingRecipients(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const handleSendDirect = async () => {
		const message = directMessage.trim();
		if (!message) {
			customToast.error("Enter a message");
			return;
		}
		if (!directUserId && !directPhone.trim()) {
			customToast.error("Select a recipient or enter a phone number");
			return;
		}
		setDirectSending(true);
		try {
			const body: { message: string; userId?: string; phone?: string } = { message };
			if (directUserId) body.userId = directUserId;
			else body.phone = directPhone.replace(/\D/g, "");
			const res = await api.post("/marketing/direct", body);
			const data = res.data?.data ?? res.data;
			if (data?.success) {
				customToast.success("Message sent");
				setDirectMessage("");
			} else {
				customToast.error("Failed to send");
			}
		} catch (err: unknown) {
			const e = err as { response?: { data?: { error?: { message?: string } } } };
			customToast.error(e?.response?.data?.error?.message ?? "Failed to send");
		} finally {
			setDirectSending(false);
		}
	};

	const handleSendBroadcast = async () => {
		const message = broadcastMessage.trim();
		if (!message) {
			customToast.error("Enter a message");
			return;
		}
		const ids = Array.from(selectedIds);
		if (ids.length === 0) {
			customToast.error("Select at least one recipient");
			return;
		}
		setBroadcastSending(true);
		setLastResult(null);
		try {
			const res = await api.post("/marketing/broadcast", { userIds: ids, message });
			const data = res.data?.data ?? res.data;
			setLastResult({ sent: data?.sent ?? 0, total: data?.total ?? ids.length });
			if ((data?.sent ?? 0) > 0) {
				customToast.success(`Sent to ${data.sent} of ${data.total} recipients`);
			} else {
				customToast.error("No messages were sent");
			}
		} catch (err: unknown) {
			const e = err as { response?: { data?: { error?: { message?: string } } } };
			customToast.error(e?.response?.data?.error?.message ?? "Broadcast failed");
		} finally {
			setBroadcastSending(false);
		}
	};

	const toggleBroadcastRecipient = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const selectAllBroadcast = () => {
		if (selectedIds.size === recipients.length) setSelectedIds(new Set());
		else setSelectedIds(new Set(recipients.map((r) => r.id)));
	};

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			<div className="px-3 lg:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shrink-0">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-lg bg-violet-100 dark:bg-violet-950/50">
						<Megaphone className="size-6 text-violet-600 dark:text-violet-400" />
					</div>
					<div>
						<h1 className="text-lg font-semibold">Marketing</h1>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							Send WhatsApp messages (broadcast or direct)
						</p>
					</div>
				</div>
				<div className="flex gap-2 mt-4">
					<button
						type="button"
						onClick={() => setTab("direct")}
						className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
							tab === "direct"
								? "bg-violet-600 text-white"
								: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
						}`}>
						Direct message
					</button>
					<button
						type="button"
						onClick={() => setTab("broadcast")}
						className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
							tab === "broadcast"
								? "bg-violet-600 text-white"
								: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
						}`}>
						Broadcast
					</button>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-3 lg:p-6">
					{loadingRecipients ? (
						<div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
							<Loader2 className="size-5 animate-spin" />
							<span>Loading recipients…</span>
						</div>
					) : tab === "direct" ? (
						<Card className="p-4 lg:p-6 border-zinc-200 dark:border-zinc-800 max-w-xl">
							<h2 className="text-base font-semibold flex items-center gap-2 mb-4">
								<Send className="size-4" />
								Direct message
							</h2>
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recipient</label>
									<select
										value={directUserId}
										onChange={(e) => {
											setDirectUserId(e.target.value);
											if (e.target.value) setDirectPhone("");
										}}
										className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
										<option value="">Select user…</option>
										{recipients.map((r) => (
											<option key={r.id} value={r.id}>
												{r.name ?? r.uniqueId} — {r.phone}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Or phone number</label>
									<input
										type="text"
										value={directPhone}
										onChange={(e) => {
											setDirectPhone(e.target.value);
											if (e.target.value) setDirectUserId("");
										}}
										placeholder="e.g. 2348012345678"
										className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
									/>
								</div>
								<div>
									<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Message</label>
									<Textarea
										value={directMessage}
										onChange={(e) => setDirectMessage(e.target.value)}
										placeholder="Type your message…"
										className="mt-1 min-h-[120px] resize-y"
										rows={4}
									/>
								</div>
								<Button
									onClick={handleSendDirect}
									disabled={directSending}
									className="bg-violet-600 hover:bg-violet-700">
									{directSending ? (
										<Loader2 className="size-4 animate-spin mr-2" />
									) : (
										<Send className="size-4 mr-2" />
									)}
									Send
								</Button>
							</div>
						</Card>
					) : (
						<Card className="p-4 lg:p-6 border-zinc-200 dark:border-zinc-800 max-w-2xl">
							<h2 className="text-base font-semibold flex items-center gap-2 mb-4">
								<Users className="size-4" />
								Broadcast
							</h2>
							{recipients.length === 0 ? (
								<p className="text-sm text-zinc-500 dark:text-zinc-400">No recipients with phone numbers.</p>
							) : (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Button variant="outline" size="sm" onClick={selectAllBroadcast}>
											{selectedIds.size === recipients.length ? "Deselect all" : "Select all"}
										</Button>
										<span className="text-sm text-zinc-500">
											{selectedIds.size} selected
										</span>
									</div>
									<ScrollArea className="h-[200px] rounded border border-zinc-200 dark:border-zinc-700 p-2">
										<div className="space-y-1">
											{recipients.map((r) => (
												<label
													key={r.id}
													className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
													<input
														type="checkbox"
														checked={selectedIds.has(r.id)}
														onChange={() => toggleBroadcastRecipient(r.id)}
														className="rounded border-zinc-300 dark:border-zinc-600"
													/>
													<span className="text-sm truncate">
														{r.name ?? r.uniqueId} — {r.phone}
													</span>
												</label>
											))}
										</div>
									</ScrollArea>
									<div>
										<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Message</label>
										<Textarea
											value={broadcastMessage}
											onChange={(e) => setBroadcastMessage(e.target.value)}
											placeholder="Message to send to all selected…"
											className="mt-1 min-h-[100px] resize-y"
											rows={4}
										/>
									</div>
									{lastResult && (
										<div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
											{lastResult.sent === lastResult.total ? (
												<CheckCircle2 className="size-4 text-green-600" />
											) : (
												<AlertCircle className="size-4 text-amber-600" />
											)}
											<span>
												Sent to {lastResult.sent} of {lastResult.total} recipients
											</span>
										</div>
									)}
									<Button
										onClick={handleSendBroadcast}
										disabled={broadcastSending}
										className="bg-violet-600 hover:bg-violet-700">
										{broadcastSending ? (
											<Loader2 className="size-4 animate-spin mr-2" />
										) : (
											<Send className="size-4 mr-2" />
										)}
										Send broadcast
									</Button>
								</div>
							)}
						</Card>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
