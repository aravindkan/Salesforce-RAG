import * as assert from "assert";
import { classifyIntent } from "../intents/intentClassifier";

suite("Intent Classifier", () => {
    test("classifies a location question as search", () => {
        const result = classifyIntent(
            "Where is the Contact updated?"
        );

        assert.strictEqual(result.intent, "search");
        assert.ok(result.confidence > 0);
        assert.ok(result.matchedSignals.includes("where"));
    });

    test("classifies an explanation question as explain", () => {
        const result = classifyIntent(
            "Explain how ContactHelper works"
        );

        assert.strictEqual(result.intent, "explain");
        assert.ok(result.confidence > 0);
        assert.ok(result.matchedSignals.includes("explain"));
    });

    test("classifies an unsupported question as unknown", () => {
        const result = classifyIntent(
            "Tell me about this code"
        );

        assert.strictEqual(result.intent, "unknown");
        assert.strictEqual(result.confidence, 0);
        assert.deepStrictEqual(result.matchedSignals, []);
    });
});