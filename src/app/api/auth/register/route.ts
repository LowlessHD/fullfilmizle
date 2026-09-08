import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Lütfen tüm zorunlu alanları doldurun." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanUsername = String(username).trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifreniz en az 6 karakterden oluşmalıdır." },
        { status: 400 }
      );
    }

    // E-posta veya kullanıcı adı daha önce alınmış mı?
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten kullanımda." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten alınmış." },
        { status: 400 }
      );
    }

    // Şifreyi bcrypt ile hash'le
    const passwordHash = await bcrypt.hash(password, 12);

    // Yeni kullanıcıyı kaydet
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Kayıt olma hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
