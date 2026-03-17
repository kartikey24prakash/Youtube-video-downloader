const BASE = "http://localhost:5000/api/video";

export async function fetchVideoInfo(url) {
  const res = await fetch(`${BASE}/info?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch video info.");
  return data;
}

export async function downloadVideo({ url, format_id, type }) {
  const res = await fetch(`${BASE}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format_id, type }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Download failed.");
  return data;
}
