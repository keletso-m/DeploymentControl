import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { owner: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
   const body = await request.json();
  const { name, repository, defaultBranch } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: {
      name,
      repository: repository ?? null,
      defaultBranch: defaultBranch ?? "main",
      owner: { connect: { email: session.user.email } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}