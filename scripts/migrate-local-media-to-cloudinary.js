/*
  Migrates local logos under public/uploads/logos to Cloudinary.
  Usage:
    node scripts/migrate-local-media-to-cloudinary.js
    node scripts/migrate-local-media-to-cloudinary.js --delete   // deletes local files after successful upload

  Requires environment variables:
    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
*/

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, 'public', 'uploads', 'logos');
const CLOUD_FOLDER = 'personal-blog/site/logo';

function sanitize(name) {
  return (name || 'file')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
    .slice(0, 100);
}

async function uploadFile(fullPath, baseName) {
  const stat = await fsp.stat(fullPath);
  if (!stat.isFile()) return null;

  const nameNoExt = sanitize(baseName.replace(path.extname(baseName), ''));
  const publicId = `${nameNoExt}-${Date.now()}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUD_FOLDER,
        public_id: publicId,
        overwrite: false,
        unique_filename: false,
        resource_type: 'image',
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
        strip_metadata: true,
        width: 2048,
        height: 2048,
        crop: 'limit',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    fs.createReadStream(fullPath).pipe(uploadStream);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const shouldDelete = args.includes('--delete');

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary env vars. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  try {
    await fsp.access(LOCAL_DIR);
  } catch {
    console.error('Local directory not found:', LOCAL_DIR);
    process.exit(1);
  }

  const files = await fsp.readdir(LOCAL_DIR);
  if (files.length === 0) {
    console.log('No files to migrate in', LOCAL_DIR);
    return;
  }

  console.log(`Found ${files.length} files. Starting migration to Cloudinary folder: ${CLOUD_FOLDER}`);

  let ok = 0, fail = 0;
  for (const f of files) {
    const full = path.join(LOCAL_DIR, f);
    try {
      const res = await uploadFile(full, f);
      console.log('Uploaded:', f, '->', res.secure_url);
      ok++;
      if (shouldDelete) {
        await fsp.unlink(full);
        console.log('Deleted local file:', f);
      }
    } catch (e) {
      console.error('Failed:', f, e.message || e);
      fail++;
    }
  }

  console.log(`Migration completed. Success: ${ok}, Failed: ${fail}`);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
