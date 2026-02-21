import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {createBookSchema} from "@/lib/validators";
import {requireAdmin, requireUser} from "@/lib/authz";

export async function GET(req: Request) {
    const user = await requireUser();
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {searchParams} = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    const books = await prisma.book.findMany({
        where: q
            ? {
                OR: [
                    {title: {contains: q}},
                    {author: {contains: q}},
                    {genre: {contains: q}},
                    {isbn: {contains: q}},
                    {description: {contains: q}},
                ],
            }
            : undefined,
        orderBy: {createdAt: "desc"},
        include: {
            checkedOutBy: {select: {id: true, name: true, email: true}},
        },
    });

    return NextResponse.json({books});
}

export async function POST(req: Request) {
    const user = await requireAdmin();
    if (!user) {
        return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const body = await req.json().catch(() => null);

    const payload = {
        ...body,
        publishedYear:
            typeof body?.publishedYear === "number" || Number.isNaN(body?.publishedYear)
                ? body.publishedYear
                : body?.publishedYear
                    ? Number(body.publishedYear)
                    : undefined,
    };

    const parsed = createBookSchema.safeParse(payload);
    if (!parsed.success) {
        return NextResponse.json({error: "Invalid book data"}, {status: 400});
    }

    const created = await prisma.book.create({
        data: {
            title: parsed.data.title,
            author: parsed.data.author,
            genre: parsed.data.genre || null,
            isbn: parsed.data.isbn || null,
            description: parsed.data.description || null,
            publishedYear: Number.isNaN(parsed.data.publishedYear)
                ? null
                : parsed.data.publishedYear ?? null,
        },
        include: {checkedOutBy: {select: {id: true, name: true, email: true}}},
    });

    return NextResponse.json({book: created}, {status: 201});
}
