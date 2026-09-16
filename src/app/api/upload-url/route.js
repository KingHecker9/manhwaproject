import { NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";
import { isAuthor } from "../../../lib/auth0-roles";
import { r2Client } from "../../../lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const authorized = await isAuthor(session.user.sub);
    if (!authorized) {
      return NextResponse.json({ error: "Not an author" }, { status: 403 });
    }

    const { key, contentType } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 min

    return NextResponse.json({ signedUrl, key });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}