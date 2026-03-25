import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createAuthUser,
  findAuthUserByEmail,
  getNormalizedEmail,
} from "@/lib/server/auth-user-store";

interface RegisterPayload {
  name?: string;
  email?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as RegisterPayload;
  const email = payload.email?.trim();
  const password = payload.password;
  const name = payload.name?.trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const existingUser = await findAuthUserByEmail(email);
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);
  const user = await createAuthUser({
    email: getNormalizedEmail(email),
    name,
    passwordHash,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
