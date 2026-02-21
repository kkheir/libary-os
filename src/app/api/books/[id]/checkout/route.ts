import {NextResponse} from "next/server";
import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {requireUser} from "@/lib/authz";

type Params = {params: Promise<{id: string}>};

export async function POST(_req: Request, {params}: Params) {
    const user = await requireUser();
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {id} = await params;

    const existing = await prisma.book.findUnique({where: {id}});
    if (!existing) {
        return NextResponse.json({error: "Book not found"}, {status: 404});
    }

    if (existing.checkedOut) {
        return NextResponse.json({error: "Book is already borrowed"}, {status: 409});
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const book = await tx.book.update({
            where: {id},
            data: {
                checkedOut: true,
                checkedOutAt: new Date(),
                checkedOutById: user.id,
            },
            include: {checkedOutBy: {select: {id: true, name: true, email: true}}},
        });

        await tx.borrowRecord.create({
            data: {
                bookId: id,
                userId: user.id,
            },
        });

        return book;
    });

    return NextResponse.json({book: result});
}
