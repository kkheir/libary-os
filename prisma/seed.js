/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "admin@library.local";
    const memberEmail = "member@library.local";

    const [adminPasswordHash, memberPasswordHash] = await Promise.all([
        bcrypt.hash("Admin123!", 10),
        bcrypt.hash("Member123!", 10),
    ]);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: "Library Admin",
            passwordHash: adminPasswordHash,
            role: "ADMIN",
        },
    });

    await prisma.user.upsert({
        where: { email: memberEmail },
        update: {},
        create: {
            email: memberEmail,
            name: "Library Member",
            passwordHash: memberPasswordHash,
            role: "MEMBER",
        },
    });

    const books = [
        {
            title: "Clean Code",
            author: "Robert C. Martin",
            genre: "Software Engineering",
            isbn: "9780132350884",
            publishedYear: 2008,
            description: "Best practices for writing maintainable code.",
        },
        {
            title: "The Pragmatic Programmer",
            author: "Andrew Hunt, David Thomas",
            genre: "Software Engineering",
            isbn: "9780135957059",
            publishedYear: 2019,
            description: "Timeless tips for pragmatic software craftsmanship.",
        },
        {
            title: "Designing Data-Intensive Applications",
            author: "Martin Kleppmann",
            genre: "Data Systems",
            isbn: "9781449373320",
            publishedYear: 2017,
            description: "Concepts and patterns for reliable distributed systems.",
        },
        {
            title: "Atomic Habits",
            author: "James Clear",
            genre: "Self Development",
            isbn: "9780735211292",
            publishedYear: 2018,
            description: "Practical framework for building good habits.",
        },
    ];

    for (const book of books) {
        await prisma.book.upsert({
            where: { isbn: book.isbn },
            update: {},
            create: book,
        });
    }

    console.log("Database seeded.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
