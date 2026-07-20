import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada no site." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let texto: string;
  try {
    const body = await req.json();
    texto = body.texto;
    if (!texto || typeof texto !== "string") {
      throw new Error("texto ausente");
    }
  } catch {
    return new Response(JSON.stringify({ error: "Envie { texto: string } no corpo da requisição." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content:
            "Extraia da mensagem abaixo, escrita por um cliente pedindo orçamento de móveis corporativos, uma lista de itens com quantidade. " +
            'Responda APENAS com um array JSON, sem nenhum texto antes ou depois, sem markdown, no formato: ' +
            '[{"item":"descrição do produto como o cliente escreveu","quantidade":numero}]. ' +
            "Se a quantidade não for mencionada, use 1. Mensagem do cliente:\n\n" +
            texto,
        },
      ],
    }),
  });

  const data = await anthropicResp.json();

  if (!anthropicResp.ok) {
    return new Response(JSON.stringify({ error: "Erro ao chamar a API da Anthropic", detalhe: data }), {
      status: anthropicResp.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/interpretar-pedido",
};
