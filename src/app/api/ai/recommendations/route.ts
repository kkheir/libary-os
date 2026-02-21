import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireUser} from "@/lib/authz";
import {scoreBook} from "@/lib/book-utils";

type BookForAI = {
    id: string;
    title: string;
    author: string;
    genre: string | null;
    description: string | null;
    checkedOut: boolean;
};

function buildReason(bookTitle: string, score: number, available: boolean) {
    const confidence = score >= 3 ? "high" : score >= 1.5 ? "medium" : "low";
    return `${bookTitle} has a ${confidence} topical match and is ${available ? "currently available" : "currently borrowed"}.`;
}

export async function GET(req: Request) {
    const user = await requireUser();
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {searchParams} = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    const books = (await prisma.book.findMany({
        orderBy: [{checkedOut: "asc"}, {title: "asc"}],
    })) as BookForAI[];

    const scored = books
        .map((book: BookForAI) => ({
            book,
            score: scoreBook(book, q),
        }))
        .filter((row: {book: BookForAI; score: number}) => row.score > 0 || !q)
        .sort(
            (a: {book: BookForAI; score: number}, b: {book: BookForAI; score: number}) =>
                b.score - a.score,
        )
        .slice(0, 5)
        .map((row: {book: BookForAI; score: number}) => ({
            id: row.book.id,
            title: row.book.title,
            author: row.book.author,
            genre: row.book.genre,
            checkedOut: row.book.checkedOut,
            reason: buildReason(row.book.title, row.score, !row.book.checkedOut),
            score: Number(row.score.toFixed(2)),
        }));

    const availableCount = books.filter((x: BookForAI) => !x.checkedOut).length;

    return NextResponse.json({
        query: q,
        summary:
            q.length > 0
                ? `Found ${scored.length} matches for "${q}". ${availableCount}/${books.length} books are available right now.`
                : `Catalog overview: ${books.length} books total and ${availableCount} available now.`,
        recommendations: scored,
    });
}
