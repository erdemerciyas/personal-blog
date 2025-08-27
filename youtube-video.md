# YouTube Videoları Sayfası + Admin Panel Yönetimi

Bu dosya, YouTube kanalında yayınlanan videoların (normal video + shorts) otomatik olarak sitede listelenmesi, arama/filtreleme yapılabilmesi ve admin panelinden yönetilmesi için gerekli tüm bilgileri ve örnek kodları içerir.

---

## 🎯 Amaçlar
- `/videos` sayfasında YouTube kanalındaki tüm videoları listelemek.
- Videolarda **arama ve filtreleme** desteği sağlamak.
- **Admin paneli** üzerinden videoları yönetmek:
  - Başlık/açıklama düzenleme
  - Videoyu gizleme/gösterme
  - Kategori/etiket ekleme
- **MongoDB** üzerinde `videos` koleksiyonu ile kalıcı yönetim sağlamak.

---

## 🛠️ Teknolojiler
- **Next.js 14 (App Router)**
- **YouTube Data API v3**
- **MongoDB** (video override verileri için)
- **TailwindCSS** (UI için)
- **Admin Panel** (mevcut proje yapısına entegre)

---

## 📂 Dosya Yapısı

```
/app
  /videos
    page.tsx       # Videoların listelendiği sayfa
/api
  /youtube
    route.ts       # YouTube API'den veri çeken server endpoint
/models
  Video.ts         # MongoDB videos şeması
/docs
  youtube-video.md # Bu doküman
```

---

## 🔑 Gereksinimler
`.env` dosyasına aşağıdaki bilgileri ekle:

```env
YT_API_KEY=your_api_key
YT_CHANNEL_ID=your_channel_id
MONGODB_URI=your_mongo_connection
```

---

## 🔄 Veri Akışı

1. **YouTube API** → Kanal videolarını çeker.  
2. **MongoDB (videos koleksiyonu)** → Admin panelde yapılan override bilgilerini saklar.  
3. **API Route `/api/youtube`** → YouTube + DB verilerini birleştirir.  
4. **`/videos` sayfası** → Listeleme, arama, filtreleme yapar.  
5. **Admin Panel** → Video başlığı, açıklaması, etiketleri güncellenebilir; video gizlenebilir.  

---

## 📝 Video Model (MongoDB)

`/models/Video.ts`
```ts
import mongoose, { Schema, models } from "mongoose";

const VideoSchema = new Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  thumbnail: String,
  duration: String,
  publishedAt: Date,
  type: { type: String, enum: ["short", "normal"], default: "normal" },
  status: { type: String, enum: ["visible", "hidden"], default: "visible" },
  tags: [String],
});

export default models.Video || mongoose.model("Video", VideoSchema);
```

---

## 🌐 API Route

`/app/api/youtube/route.ts`
```ts
import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const apiKey = process.env.YT_API_KEY;
  const channelId = process.env.YT_CHANNEL_ID;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=20`
  );
  const data = await res.json();

  const videos = await Promise.all(
    data.items.map(async (item: any) => {
      const vid = {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        type: item.snippet.title.toLowerCase().includes("short") ? "short" : "normal",
      };

      // DB’de varsa override bilgilerini al
      const dbVideo = await Video.findOne({ videoId: vid.videoId });
      return dbVideo ? { ...vid, ...dbVideo.toObject() } : vid;
    })
  );

  return NextResponse.json(videos);
}
```

---

## 📄 Videolar Sayfası

`/app/videos/page.tsx`
```tsx
"use client";
import { useEffect, useState } from "react";

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/youtube")
      .then(res => res.json())
      .then(data => setVideos(data));
  }, []);

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Videolar</h1>
      <input
        className="border p-2 mb-4 w-full"
        placeholder="Ara..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(video => (
          <div key={video.videoId} className="rounded-lg shadow bg-white overflow-hidden">
            <img src={video.thumbnail} alt={video.title} className="w-full" />
            <div className="p-2">
              <h2 className="font-semibold">{video.title}</h2>
              <p className="text-sm text-gray-600">
                {new Date(video.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🛠️ Admin Panel CRUD Örnekleri

### 1. Listeleme
MongoDB’den tüm videolar çekilir ve tablo/grid şeklinde gösterilir.

```ts
const videos = await Video.find().sort({ publishedAt: -1 });
```

### 2. Güncelleme (Update)
Videonun başlık, açıklama, tags veya status alanını değiştirmek için:

```ts
await Video.updateOne(
  { videoId: req.body.videoId },
  { $set: {
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
      status: req.body.status
    } 
  }
);
```

### 3. Gizleme / Gösterme
Videoyu admin panelden gizlemek için `status` alanını `"hidden"` yap:

```ts
await Video.updateOne({ videoId }, { $set: { status: "hidden" } });
```

### 4. Yeni Video Eklemek (Opsiyonel)
YouTube API’den çekilen videolar otomatik eklenir, fakat admin panelden manuel ekleme yapılacaksa:

```ts
const newVideo = new Video({
  videoId: "abc123",
  title: "Yeni Video",
  description: "Açıklama",
  thumbnail: "thumbnail_url",
  publishedAt: new Date(),
  type: "normal",
  status: "visible",
  tags: ["tag1", "tag2"]
});
await newVideo.save();
```

### Admin Panel UI Önerisi
- Tabloda: Thumbnail | Başlık | Yayın Tarihi | Type | Status | Düzenle Butonu  
- Düzenle Butonuna tıklandığında modal veya ayrı sayfa ile güncelleme formu açılır.  
- Status dropdown: `visible` / `hidden`  
- Tags input: Çoklu etiket ekleme  

---

## 🚀 Yol Haritası

1. [ ] YouTube API Key oluştur ve `.env` içine ekle.  
2. [ ] MongoDB bağlantısını yapılandır.  
3. [ ] `Video` modelini ekle.  
4. [ ] `/api/youtube` route’u hazırla.  
5. [ ] `/videos/page.tsx` oluştur.  
6. [ ] Admin paneline `Videos` sekmesi ekle.  
7. [ ] API’de YouTube verilerini DB override bilgileriyle birleştir.  
8. [ ] Test + deploy (Vercel).  

---

## 🔮 Gelecek Geliştirmeler
- Sayfalama / infinite scroll desteği  
- Kategorilere göre filtreleme (örn: “DIY”, “3D Print”)  
- Video detay sayfası (`/videos/[id]`)  
- Kullanıcıların beğenme/favori listesi oluşturması
