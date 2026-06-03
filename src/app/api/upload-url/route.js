import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin")
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, fileType } = await req.json();
  const safeName =
    "product-media/" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2) +
    "." +
    (fileName.split(".").pop() || "bin");

  // Ensure bucket exists
  await supabaseAdmin.storage
    .createBucket("media", { public: true })
    .catch(() => {});

  // Create signed upload URL - client uploads directly to Supabase
  const { data, error } = await supabaseAdmin.storage
    .from("media")
    .createSignedUploadUrl(safeName);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Get public URL
  const { data: pub } = supabaseAdmin.storage
    .from("media")
    .getPublicUrl(safeName);

  return Response.json({
    signedUrl: data.signedUrl,
    token: data.token,
    publicUrl: pub.publicUrl,
    path: safeName,
  });
}
