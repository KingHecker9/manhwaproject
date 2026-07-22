import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const series = formData.get('series');
    const chapter = formData.get('chapter');
    const files = formData.getAll('images');

    console.log(`[BACKEND] Received upload for ${series} - Chapter ${chapter}`);
    console.log(`[BACKEND] Number of pages: ${files.length}`);

    // Here you would connect to Cloudinary, AWS S3, or Supabase Storage:
    // e.g., await cloudinary.uploader.upload(...)

    return NextResponse.json({
      success: true,
      message: 'Chapter pages received successfully',
      pagesCount: files.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}