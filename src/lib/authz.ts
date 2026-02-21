import {getServerAuthSession} from "@/lib/auth";

export async function requireUser() {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
        return null;
    }
    return session.user;
}

export async function requireAdmin() {
    const user = await requireUser();
    if (!user || user.role !== "ADMIN") {
        return null;
    }
    return user;
}
