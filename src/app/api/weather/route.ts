import { NextRequest, NextResponse } from "next/server";

const WEATHER_ICONS: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
};

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 });
  }

  if (!apiKey || apiKey.startsWith("vas_")) {
    return NextResponse.json({
      temp: 22,
      description: "Partly cloudy (demo – add OPENWEATHERMAP_API_KEY)",
      humidity: 55,
      windSpeed: 3.2,
      icon: "⛅",
      city,
      daysSinceRain: 2,
    });
  }

  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData?.[0]) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const { lat, lon, name } = geoData[0];

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=cs&appid=${apiKey}`
    );
    const weather = await weatherRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const forecast = await forecastRes.json();

    let daysSinceRain = 0;
    const now = Date.now();
    const threeHourBlocks = forecast.list ?? [];

    for (let i = 0; i < Math.min(threeHourBlocks.length, 24); i++) {
      const block = threeHourBlocks[i];
      const hasRain =
        block.weather?.[0]?.main === "Rain" ||
        block.weather?.[0]?.main === "Drizzle" ||
        (block.rain?.["3h"] ?? 0) > 0;

      if (hasRain) break;
      daysSinceRain = Math.floor((now - block.dt * 1000) / (1000 * 60 * 60 * 24));
      if (i === 0 && !hasRain) daysSinceRain = Math.max(daysSinceRain, 1);
    }

    const main = weather.weather?.[0]?.main ?? "Clear";

    return NextResponse.json({
      temp: weather.main?.temp ?? 20,
      description: weather.weather?.[0]?.description ?? "",
      humidity: weather.main?.humidity ?? 50,
      windSpeed: weather.wind?.speed ?? 0,
      icon: WEATHER_ICONS[main] ?? "🌤️",
      city: name ?? city,
      daysSinceRain: Math.min(daysSinceRain, 7),
    });
  } catch {
    return NextResponse.json({ error: "Weather service unavailable" }, { status: 503 });
  }
}
