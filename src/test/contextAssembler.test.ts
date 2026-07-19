import * as assert from "assert";
import {
    assembleContext,
    ContextChunk
} from "../retrieval/contextAssembler";

suite("Context Assembler", () => {
    test("returns empty context when no chunks are provided", () => {
        const result = assembleContext([]);

        assert.strictEqual(result.context, "");
        assert.strictEqual(result.chunkCount, 0);
        assert.deepStrictEqual(result.sourceFiles, []);
    });

    test("formats a retrieved chunk as prompt-ready context", () => {
        const chunks: ContextChunk[] = [
            {
                name: "ContactHelper.updateContactStatus",
                chunkType: "method",
                fileName: "ContactHelper.cls",
                content: "public static void updateContactStatus() {}",
                score: 0.8123
            }
        ];

        const result = assembleContext(chunks);

        assert.strictEqual(result.chunkCount, 1);
        assert.deepStrictEqual(result.sourceFiles, [
            "ContactHelper.cls"
        ]);

        assert.ok(
            result.context.includes(
                "Symbol: ContactHelper.updateContactStatus"
            )
        );
        assert.ok(result.context.includes("Chunk Type: method"));
        assert.ok(
            result.context.includes("Source File: ContactHelper.cls")
        );
        assert.ok(
            result.context.includes(
                "public static void updateContactStatus() {}"
            )
        );
    });

    test("includes similarity scores when requested", () => {
        const chunks: ContextChunk[] = [
            {
                name: "ContactHelper",
                chunkType: "class",
                fileName: "ContactHelper.cls",
                content: "public class ContactHelper {}",
                score: 0.7456
            }
        ];

        const result = assembleContext(chunks, {
            includeScores: true
        });

        assert.ok(
            result.context.includes("Similarity Score: 0.7456")
        );
    });

    test("returns unique source filenames", () => {
        const chunks: ContextChunk[] = [
            {
                name: "ContactHelper.methodOne",
                chunkType: "method",
                fileName: "ContactHelper.cls",
                content: "public static void methodOne() {}"
            },
            {
                name: "ContactHelper.methodTwo",
                chunkType: "method",
                fileName: "ContactHelper.cls",
                content: "public static void methodTwo() {}"
            }
        ];

        const result = assembleContext(chunks);

        assert.deepStrictEqual(result.sourceFiles, [
            "ContactHelper.cls"
        ]);
    });
});
