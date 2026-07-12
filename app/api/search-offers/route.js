export async function POST(request) {
  const body = await request.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chatbot/search-offers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.INTERNAL_API_KEY, // server-side only
      },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
