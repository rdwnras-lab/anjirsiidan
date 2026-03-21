import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function isAdmin(s) {
  return s?.user?.role === "admin";
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const { data } = await supabaseAdmin
    .from("product_keys")
    .select("*, product_variants(id, name, price)")
    .eq("product_id", productId)
    .order("variant_id")
    .order("created_at", { ascending: false });
  return Response.json(data || []);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { productId, variantId, keys } = await req.json();
  const rows = keys.map((k) => ({
    product_id: productId,
    variant_id: variantId,
    key_content: k.trim(),
  }));
  const { error } = await supabaseAdmin.from("product_keys").insert(rows);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ count: rows.length });
}
