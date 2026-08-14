import { afterEach, describe, expect, it } from "vitest";
import { allowGeneration, resetGenerationRateLimit } from "./rate-limit";

afterEach(resetGenerationRateLimit);
describe("generation rate limiting", () => { it("limits repeated calls in one window", () => { for (let index = 0; index < 5; index += 1) expect(allowGeneration("test", 100)).toBe(true); expect(allowGeneration("test", 100)).toBe(false); }); });
