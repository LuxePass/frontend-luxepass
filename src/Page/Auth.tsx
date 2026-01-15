import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export const AuthFlow = () => {
	const { login, verify2FA, loading } = useAuth();
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [show2FA, setShow2FA] = useState(false);
	const [tempToken, setTempToken] = useState("");
	const [totpCode, setTotpCode] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (isLogin) {
				const result = await login(email, password);
				if (result.requiresTwoFactor && result.tempToken) {
					setShow2FA(true);
					setTempToken(result.tempToken);
					toast.info("Two-factor authentication required");
				} else {
					toast.success("Log in successful!");
				}
			} else {
				toast.error(
					"PA Sign up is currently disabled. Please contact system admin."
				);
			}
		} catch (err: unknown) {
			const errorObj = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const message =
				errorObj.response?.data?.message ||
				errorObj.message ||
				"Authentication failed. Please check your credentials.";
			toast.error(message);
		}
	};

	const handle2FAVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await verify2FA(tempToken, totpCode);
			toast.success("Log in successful!");
		} catch (err: unknown) {
			const errorObj = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const message =
				errorObj.response?.data?.message || errorObj.message || "Invalid 2FA code";
			toast.error(message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
			<div className="w-full max-w-md space-y-8">
				{/* Logo and Header */}
				<div className="text-center space-y-3">
					<div>
						<h1 className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
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
					{show2FA ? (
						<form
							onSubmit={handle2FAVerify}
							className="space-y-5">
							<div className="space-y-2 text-center">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
									Two-Step Verification
								</h2>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">
									Enter the 6-digit code from your authenticator app
								</p>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="otp"
									className="text-sm text-zinc-700 dark:text-zinc-300">
									Verification Code
								</Label>
								<div className="relative">
									<Input
										id="otp"
										type="text"
										placeholder="000000"
										maxLength={6}
										value={totpCode}
										onChange={(e) => setTotpCode(e.target.value)}
										className="text-center text-2xl tracking-[1em] h-14 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-mono"
										required
										autoFocus
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-none"
								disabled={loading}>
								{loading ? (
									<span className="flex items-center gap-2">
										<div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Verifying...
									</span>
								) : (
									<span className="flex items-center gap-2">
										Verify and Sign In
										<ArrowRight className="size-4" />
									</span>
								)}
							</Button>

							<button
								type="button"
								onClick={() => setShow2FA(false)}
								className="w-full text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300">
								Back to Login
							</button>
						</form>
					) : (
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
											className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-sans"
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
										className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-sans"
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
										className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-sans"
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
								className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-none"
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

							{/* Divider */}
							<div className="relative">
								<Separator className="bg-zinc-200 dark:bg-zinc-800" />
								<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-500 font-medium">
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
										className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
										{isLogin ? "Sign up" : "Sign in"}
									</button>
								</p>
							</div>
						</form>
					)}
				</Card>

				{/* Footer */}
				<p className="text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
					By continuing, you agree to Luxepass's Terms of Service and Privacy Policy
				</p>
			</div>
		</div>
	);
};
