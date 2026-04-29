import { describe, it, expect } from "vitest";
import { clsx } from "clsx";

describe("clsx utility", () => {
	it("merges class names", () => {
		expect(clsx("a", "b")).toBe("a b");
	});

	it("ignores falsy values", () => {
		expect(clsx("a", false, null, undefined, "b")).toBe("a b");
	});
});
