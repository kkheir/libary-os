import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {prisma} from "@/lib/prisma";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: {label: "Email", type: "email"},
            password: {label: "Password", type: "password"},
        },
        async authorize(credentials) {
            const parsed = credentialsSchema.safeParse(credentials);
            if (!parsed.success) return null;

            const user = await prisma.user.findUnique({where: {email: parsed.data.email}});
            if (!user?.passwordHash) return null;

            const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
            if (!valid) return null;

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            };
        },
    }),
];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    providers.push(
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    );
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    session: {strategy: "jwt"},
    pages: {signIn: "/login"},
    providers,
    callbacks: {
        async signIn({user}) {
            if (!user.email) return false;

            const adminEmails = (process.env.ADMIN_EMAILS ?? "")
                .split(",")
                .map((x) => x.trim().toLowerCase())
                .filter(Boolean);

            if (adminEmails.includes(user.email.toLowerCase())) {
                await prisma.user.update({where: {email: user.email}, data: {role: "ADMIN"}});
            }

            return true;
        },
        async jwt({token, user}) {
            if (user?.email) {
                const dbUser = await prisma.user.findUnique({where: {email: user.email}});
                token.role = dbUser?.role ?? "MEMBER";
            }
            return token;
        },
        async session({session, token}) {
            if (session.user) {
                session.user.id = token.sub ?? "";
                session.user.role = (token.role as "ADMIN" | "MEMBER") ?? "MEMBER";
            }
            return session;
        },
    },
};
