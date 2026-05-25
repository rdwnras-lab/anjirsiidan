import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function isAdmin(s) {
  return s?.user?.role === "admin";
}

async function getCategoryId(name) {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id")
    .eq("slug", name)
    .single();
  if (data?.id) return data.id;
  const { data: created } = await supabaseAdmin
    .from("categories")
    .insert({
      name: name.toUpperCase(),
      slug: name,
      is_active: true,
      sort_order: 999,
    })
    .select("id")
    .single();
  return created?.id;
}

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("products")
    .select(
      "*, categories(id, name, slug), product_variants(id, name, price, stock, sort_order)"
    )
    .eq("id", params.id)
    .single();

  if (!data)
    return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { variant_sync, category_slug, ...rest } = body;

  const updateData = {
    ...rest,
    updated_at: new Date().toISOString(),
  };

  if (category_slug) {
    updateData.category_id = await getCategoryId(category_slug);
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update(updateData)
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Sync variants
  if (variant_sync?.length) {
    // Delete existing variants
    await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("product_id", params.id);
    // Re-insert
    await supabaseAdmin.from("product_variants").insert(
      variant_sync.map((v, i) => ({
        product_id: params.id,
        name: v.name,
        price: parseInt(v.price),
        stock: v.stock ?? 999,
        sort_order: i,
        is_active: true,
      }))
    );
  }

  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("product_id", params.id);
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
