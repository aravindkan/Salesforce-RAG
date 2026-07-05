export function extractKeywords(question: string): string[] {

    return question
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(word =>
            word.length > 2 &&
            ![
                "where",
                "what",
                "when",
                "does",
                "which",
                "that",
                "this",
                "with",
                "from",
                "into",
                "have",
                "there",
                "about",
                "please",
                "show",
                "find"
            ].includes(word)
        );
}