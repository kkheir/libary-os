type BookLike = {
    title: string;
    author: string;
    genre: string | null;
    description: string | null;
    checkedOut: boolean;
};

export function normalizeTokens(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

export function scoreBook(book: BookLike, query: string) {
    const queryTokens = normalizeTokens(query);
    if (!queryTokens.length) {
        return 0;
    }

    const haystack = normalizeTokens(
        [book.title, book.author, book.genre ?? "", book.description ?? ""].join(" "),
    );

    const set = new Set(haystack);
    const tokenScore = queryTokens.reduce((acc, token) => acc + (set.has(token) ? 1 : 0), 0);

    const availabilityBoost = book.checkedOut ? 0 : 0.5;
    return tokenScore + availabilityBoost;
}
