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

    if (!existing.checkedOut) {
        return NextResponse.json({error: "Book is not currently borrowed"}, {status: 409});
    }

    const canReturn = user.role === "ADMIN" || existing.checkedOutById === user.id;
    if (!canReturn) {
        return NextResponse.json({error: "Only the borrower or admin can return this book"}, {status: 403});
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const openRecord = await tx.borrowRecord.findFirst({
            where: {
                bookId: id,
                returnedAt: null,
            },
            orderBy: {borrowedAt: "desc"},
        });

        if (openRecord) {
            await tx.borrowRecord.update({
                where: {id: openRecord.id},
                data: {returnedAt: new Date()},
            });
        }

        return tx.book.update({
            where: {id},
            data: {
                checkedOut: false,
                checkedOutAt: null,
                checkedOutById: null,
            },
            include: {checkedOutBy: {select: {id: true, name: true, email: true}}},
        });
    });

    return NextResponse.json({book: result});
}
