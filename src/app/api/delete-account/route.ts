import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Право быть забытым (GDPR čl. 17) – kompletní smazání účtu.
 *
 * Mazání z tabulky "profiles" (přes anon klíč z prohlížeče) NESTAČÍ samo
 * o sobě – smaže sice řádek v profiles a díky "on delete cascade" i
 * navázaná data (idle_game, harvests, garden_beds, plants, chat_messages),
 * ale samotný účet (e-mail + heslo) v auth.users zůstane. Ten smí smazat
 * jen Admin API se service_role klíčem, a to smí běžet POUZE na serveru
 * (nikdy v prohlížeči, service_role obchází všechna RLS pravidla).
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "Chybí přihlašovací token." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server není nakonfigurovaný pro mazání účtů (chybí SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Ověříme token a zjistíme ID uživatele ZE SERVERU – nikdy nedůvěřujeme
  // id poslanému z klienta, jinak by kdokoliv mohl smazat cizí účet.
  const { data: userData, error: userErr } = await admin.auth.getUser(accessToken);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Neplatná nebo vypršelá session." }, { status: 401 });
  }

  const userId = userData.user.id;

  // Nejdřív smažeme profil (cascade smaže vše navázané), pak samotný auth účet.
  await admin.from("profiles").delete().eq("id", userId);
  const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
