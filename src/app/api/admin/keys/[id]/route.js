import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin")
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  await supabaseAdmin.from("product_keys").delete().eq("id", params.id);
  return Response.json({ ok: true });
}
