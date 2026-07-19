export interface ContextChunk {
    name: string;
    chunkType: string;
    fileName: string;
    content: string;
    score?: number;
}

export interface ContextAssemblyOptions {
    includeScores?: boolean;
}

export interface AssembledContext {
    context: string;
    chunkCount: number;
    sourceFiles: string[];
}

/**
 * Converts retrieved source-code chunks into structured,
 * prompt-ready context.
 *
 * Sprint 3.1 intentionally preserves the existing retrieval behavior.
 * Neighbor expansion, token budgeting, and intent-aware assembly will
 * be introduced in later Sprint 3 increments.
 */
export function assembleContext(
    chunks: ContextChunk[],
    options: ContextAssemblyOptions = {}
): AssembledContext {
    if (chunks.length === 0) {
        return {
            context: "",
            chunkCount: 0,
            sourceFiles: []
        };
    }

    const formattedChunks = chunks.map((chunk, index) => {
        const scoreLine =
            options.includeScores && chunk.score !== undefined
                ? `Similarity Score: ${chunk.score.toFixed(4)}\n`
                : "";

        return [
            `--- Retrieved Chunk ${index + 1} ---`,
            `Symbol: ${chunk.name}`,
            `Chunk Type: ${chunk.chunkType}`,
            `Source File: ${chunk.fileName}`,
            scoreLine.trimEnd(),
            "Source Code:",
            chunk.content.trim()
        ]
            .filter(line => line.length > 0)
            .join("\n");
    });

    return {
        context: formattedChunks.join("\n\n"),
        chunkCount: chunks.length,
        sourceFiles: [...new Set(chunks.map(chunk => chunk.fileName))]
    };
}
