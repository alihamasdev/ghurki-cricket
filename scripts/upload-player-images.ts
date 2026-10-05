import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Load environment variables from .env.local or apps/server/.env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), "apps/server/.env") });

const storageUrl = process.env.SUPABASE_STORAGE_URL;
const supabaseUrl =
	process.env.SUPABASE_URL ||
	(storageUrl ? new URL(storageUrl).origin : undefined) ||
	(process.env.SUPABASE_PROJECT_REF ? `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co` : undefined);

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !supabaseKey) {
	console.error("❌ Missing SUPABASE_STORAGE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local or apps/server/.env!");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = "players";

async function ensureBucket() {
	const { data: buckets, error } = await supabase.storage.listBuckets();
	if (error) {
		console.warn("⚠️ Could not list buckets:", error.message);
		return;
	}

	const existing = buckets.find((b) => b.name === BUCKET_NAME);
	if (!existing) {
		console.log(`📦 Creating public bucket "${BUCKET_NAME}"...`);
		const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
			public: true,
			allowedMimeTypes: ["image/webp"],
		});
		if (createErr) throw createErr;
	} else if (!existing.public || !existing.allowed_mime_types?.includes("image/webp")) {
		console.log(`⚙️ Updating bucket "${BUCKET_NAME}" settings...`);
		await supabase.storage.updateBucket(BUCKET_NAME, {
			public: true,
			allowedMimeTypes: ["image/webp"],
		});
	}
}

async function processAndUpload() {
	const playersDir = path.resolve(process.cwd(), "players");
	const avatarsDir = path.join(playersDir, "avatars");
	const profilesDir = path.join(playersDir, "profiles");

	fs.mkdirSync(avatarsDir, { recursive: true });
	fs.mkdirSync(profilesDir, { recursive: true });

	await ensureBucket();

	// 1. Check for raw images directly in players/ (png, jpg, jpeg, webp)
	const rootFiles = fs.existsSync(playersDir)
		? fs
				.readdirSync(playersDir, { withFileTypes: true })
				.filter((dirent) => dirent.isFile() && !dirent.name.startsWith("."))
				.map((dirent) => dirent.name)
		: [];

	const imageExtensions = [".png", ".jpg", ".jpeg", ".webp"];
	const rawImages = rootFiles.filter((file) => imageExtensions.includes(path.extname(file).toLowerCase()));

	if (rawImages.length > 0) {
		console.log(`🖼️ Processing ${rawImages.length} raw images from players/ with sharp...`);
		for (const file of rawImages) {
			const ext = path.extname(file);
			const baseName = path.basename(file, ext).trim().toLowerCase();
			const inputPath = path.join(playersDir, file);

			const profilePath = path.join(profilesDir, `${baseName}.webp`);
			const avatarPath = path.join(avatarsDir, `${baseName}.webp`);

			// Profile: 500x500 WebP (quality 80)
			await sharp(inputPath).resize(500, 500, { fit: "cover" }).webp({ quality: 80 }).toFile(profilePath);

			// Avatar: 64x64 WebP (quality 75)
			await sharp(inputPath).resize(64, 64, { fit: "cover" }).webp({ quality: 75 }).toFile(avatarPath);

			console.log(`  ✓ Converted "${file}" -> profiles/${baseName}.webp & avatars/${baseName}.webp`);
		}
	}

	// 2. Upload all images in avatars/ and profiles/ to Supabase
	const uploadVariants = [
		{ folder: avatarsDir, variant: "avatars" },
		{ folder: profilesDir, variant: "profiles" },
	];

	let totalUploaded = 0;

	for (const { folder, variant } of uploadVariants) {
		if (!fs.existsSync(folder)) continue;
		const files = fs.readdirSync(folder).filter((f) => f.endsWith(".webp") && !f.startsWith("."));

		console.log(`\n🚀 Uploading ${files.length} images to ${BUCKET_NAME}/${variant}/...`);

		for (const file of files) {
			const filePath = path.join(folder, file);
			const fileBuffer = fs.readFileSync(filePath);
			const storagePath = `${variant}/${file}`;

			const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, fileBuffer, {
				contentType: "image/webp",
				upsert: true,
			});

			if (error) {
				console.error(`  ❌ Failed to upload ${storagePath}:`, error.message);
			} else {
				console.log(`  ✅ Uploaded ${storagePath} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
				totalUploaded++;
			}
		}
	}

	console.log(`\n🎉 Finished! Uploaded ${totalUploaded} images to Supabase Storage (${BUCKET_NAME} bucket).`);
}

processAndUpload().catch((err) => {
	console.error("❌ Fatal error:", err);
	process.exit(1);
});
