export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chatbotId = searchParams.get("chatbotId");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chatbot/properties?chatbotId=${encodeURIComponent(chatbotId)}`,
    {
      method: "GET",
      headers: {
        "x-internal-key": process.env.INTERNAL_API_KEY, // server-side only
      },
    },
  );

  const data = await res.json();
  return Response.json(data, { status: res.status });
}