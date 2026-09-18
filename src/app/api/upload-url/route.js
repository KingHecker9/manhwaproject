import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { isAuthor } from "@/lib/auth0-roles";
import { r2Client } from "@/lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const authorized = await isAuthor(session.user.sub);
    if (!authorized) {
      return NextResponse.json({ error: "Author permissions required" }, { status: 403 });
    }

    const { key, contentType } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Missing upload object key" }, { status: 400 });
    }

    if (!process.env.R2_BUCKET_NAME) {
      return NextResponse.json({ error: "R2_BUCKET_NAME environment variable is not configured" }, { status: 500 });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 }); // 10 min

    return NextResponse.json({ signedUrl, key });
  } catch (err) {
    console.error("Presign upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate presigned upload URL" }, { status: 500 });
  }
}