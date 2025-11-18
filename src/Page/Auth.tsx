import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

interface AuthFlowProps {
	onLogin: (email: string, name: string) => void;
}

export const AuthFlow = ({ onLogin }: AuthFlowProps) => {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			onLogin(email, name || email.split("@")[0]);
			setLoading(false);
		}, 1000);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
			<div className="w-full max-w-md space-y-8">
				{/* Logo and Header */}
				<div className="text-center space-y-3">
					<div>
						<h1 className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
							Luxepass PA
						</h1>
						<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
							{isLogin
								? "Welcome back to your dashboard"
								: "Create your admin account"}
						</p>
					</div>
				</div>

				{/* Auth Card */}
				<Card className="p-6 lg:p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<form
						onSubmit={handleSubmit}
						className="space-y-5">
						{/* Name Field (Signup Only) */}
						{!isLogin && (
							<div className="space-y-2">
								<Label
									htmlFor="name"
									className="text-sm text-zinc-700 dark:text-zinc-300">
									Full Name
								</Label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
									<Input
										id="name"
										type="text"
										placeholder="Adebayo Okonkwo"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
										required={!isLogin}
									/>
								</div>
							</div>
						)}

						{/* Email Field */}
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-sm text-zinc-700 dark:text-zinc-300">
								Email Address
							</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
								<Input
									id="email"
									type="email"
									placeholder="admin@luxepass.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
									required
								/>
							</div>
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm text-zinc-700 dark:text-zinc-300">
								Password
							</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
									required
								/>
							</div>
						</div>

						{/* Forgot Password (Login Only) */}
						{isLogin && (
							<div className="flex justify-end">
								<button
									type="button"
									className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
									Forgot password?
								</button>
							</div>
						)}

						{/* Submit Button */}
						<Button
							type="submit"
							className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
							disabled={loading}>
							{loading ? (
								<span className="flex items-center gap-2">
									<div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									{isLogin ? "Signing in..." : "Creating account..."}
								</span>
							) : (
								<span className="flex items-center gap-2">
									{isLogin ? "Sign In" : "Create Account"}
									<ArrowRight className="size-4" />
								</span>
							)}
						</Button>

						{/* Demo Credentials (Login Only) */}
						{isLogin && (
							<div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900">
								<div className="flex items-start gap-2">
									<Sparkles className="size-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
									<div className="space-y-1">
										<p className="text-xs text-violet-900 dark:text-violet-300">
											Demo Credentials
										</p>
										<p className="text-xs text-violet-600 dark:text-violet-400">
											Email: admin@luxepass.com
											<br />
											Password: demo123
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Divider */}
						<div className="relative">
							<Separator className="bg-zinc-200 dark:bg-zinc-800" />
							<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-500">
								or
							</span>
						</div>

						{/* Toggle Login/Signup */}
						<div className="text-center">
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								{isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
								<button
									type="button"
									onClick={() => setIsLogin(!isLogin)}
									className="text-violet-600 dark:text-violet-400 hover:underline">
									{isLogin ? "Sign up" : "Sign in"}
								</button>
							</p>
						</div>
					</form>
				</Card>

				{/* Footer */}
				<p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
					By continuing, you agree to Luxepass's Terms of Service and Privacy Policy
				</p>
			</div>
		</div>
	);
};
