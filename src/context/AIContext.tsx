import React, { createContext, useContext, useState, useCallback } from "react";

export interface AIContextValue {
	conversationId: string | null;
	userIdentifier: string | null;
	includeCatalog: boolean;
	setAIContext: (ctx: {
		conversationId?: string | null;
		userIdentifier?: string | null;
		includeCatalog?: boolean;
	}) => void;
}

const AIContext = createContext<AIContextValue | null>(null);

export function AIContextProvider({ children }: { children: React.ReactNode }) {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
	const [includeCatalog, setIncludeCatalog] = useState(false);

	const setAIContext = useCallback(
		(ctx: {
			conversationId?: string | null;
			userIdentifier?: string | null;
			includeCatalog?: boolean;
		}) => {
			if (ctx.conversationId !== undefined) setConversationId(ctx.conversationId);
			if (ctx.userIdentifier !== undefined) setUserIdentifier(ctx.userIdentifier);
			if (ctx.includeCatalog !== undefined) setIncludeCatalog(ctx.includeCatalog);
		},
		[],
	);

	const value: AIContextValue = {
		conversationId,
		userIdentifier,
		includeCatalog,
		setAIContext,
	};

	return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext() {
	const ctx = useContext(AIContext);
	return ctx;
}
