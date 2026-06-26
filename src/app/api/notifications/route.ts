import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { userId, city, plantIds, locale } = await request.json();

  if (!userId || !city) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  let daysSinceRain = 3;

  if (apiKey && !apiKey.startsWith("vas_")) {
    try {
      const weatherRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/weather?city=${encodeURIComponent(city)}`
      );
      const weather = await weatherRes.json();
      daysSinceRain = weather.daysSinceRain ?? 3;
    } catch {
      /* use default */
    }
  }

  const newNotifications: Array<{
    user_id: string;
    type: string;
    message_key: string;
    params: Record<string, string | number>;
    read: boolean;
  }> = [];

  if (daysSinceRain >= 3 && plantIds?.length > 0) {
    const plantId = plantIds[0];
    newNotifications.push({
      user_id: userId,
      type: "water",
      message_key: "waterReminder",
      params: { days: daysSinceRain, plant: plantId },
      read: false,
    });
  }

  const month = new Date().getMonth() + 1;
  if (month <= 4 || month >= 10) {
    newNotifications.push({
      user_id: userId,
      type: "frost",
      message_key: "frostWarning",
      params: {},
      read: false,
    });
  }

  if (newNotifications.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`);

    if (!existing || existing.length === 0) {
      await supabase.from("notifications").insert(newNotifications);
    }
  }

  return NextResponse.json({ ok: true, created: newNotifications.length });
}
