import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {updateBookSchema} from "@/lib/validators";
import {requireAdmin} from "@/lib/authz";

type Params = {params: Promise<{id: string}>};

export async function PUT(req: Request, {params}: Params) {
    const user = await requireAdmin();
    if (!user) {
        return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const {id} = await params;
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

    const parsed = updateBookSchema.safeParse(payload);
    if (!parsed.success) {
        return NextResponse.json({error: "Invalid update data"}, {status: 400});
    }

    try {
        const updated = await prisma.book.update({
            where: {id},
            data: {
                title: parsed.data.title,
                author: parsed.data.author,
                genre: parsed.data.genre || null,
                isbn: parsed.data.isbn || null,
                description: parsed.data.description || null,
                publishedYear:
                    parsed.data.publishedYear === undefined || Number.isNaN(parsed.data.publishedYear)
                        ? null
                        : parsed.data.publishedYear,
            },
            include: {checkedOutBy: {select: {id: true, name: true, email: true}}},
        });

        return NextResponse.json({book: updated});
    } catch {
        return NextResponse.json({error: "Book not found"}, {status: 404});
    }
}

export async function DELETE(_req: Request, {params}: Params) {
    const user = await requireAdmin();
    if (!user) {
        return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const {id} = await params;

    try {
        await prisma.book.delete({where: {id}});
        return NextResponse.json({ok: true});
    } catch {
        return NextResponse.json({error: "Book not found"}, {status: 404});
    }
}
