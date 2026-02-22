import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";
import {registerSchema} from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({error: "Invalid input"}, {status: 400});
        }

        const existing = await prisma.user.findUnique({where: {email: parsed.data.email}});
        if (existing) {
            return NextResponse.json({error: "Email already registered"}, {status: 409});
        }

        const passwordHash = await bcrypt.hash(parsed.data.password, 10);

        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
            .split(",")
            .map((x) => x.trim().toLowerCase())
            .filter(Boolean);

        await prisma.user.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                passwordHash,
                role: adminEmails.includes(parsed.data.email.toLowerCase()) ? "ADMIN" : "MEMBER",
            },
        });

        return NextResponse.json({ok: true}, {status: 201});
    } catch (error) {
        console.error("Register API error", error);
        return NextResponse.json({error: "Registration failed"}, {status: 500});
    }
}
