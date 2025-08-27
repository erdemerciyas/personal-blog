import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Video from "@/models/Video";
import mongoose from "mongoose";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const { status } = await req.json();
    
    if (!status || !['visible', 'hidden'].includes(status)) {
      return NextResponse.json({ error: "Geçerli bir durum belirtin" }, { status: 400 });
    }

    const video = await Video.findByIdAndUpdate(
      params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!video) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Video ${status === 'visible' ? 'görünür yapıldı' : 'gizlendi'}`,
      video
    });

  } catch (error: any) {
    console.error("Error updating video status:", error);
    return NextResponse.json(
      { error: "Video durumu güncellenirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}