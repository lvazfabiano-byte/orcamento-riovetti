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

  let pdfBase64: string;
  try {
    const body = await req.json();
    pdfBase64 = body.pdfBase64;
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      throw new Error("pdfBase64 ausente");
    }
  } catch {
    return new Response(JSON.stringify({ error: "Envie { pdfBase64: string } no corpo da requisição." }), {
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
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
            {
              type: "text",
              text:
                "Este PDF é um estudo/projeto de arquitetura de interiores com a planta baixa de um ambiente corporativo. " +
"Liste cada peça de mobiliário corporativo necessária (mesas, cadeiras, armários, estações de trabalho etc.) e o ambiente onde fica. " +
"IMPORTANTE: a quantidade de cada item deve vir SOMENTE de contar unidades desenhadas de fato na planta (ex: marcadores numerados, ícones de móveis repetidos, ou uma legenda explícita de quantidade). " +
"NUNCA use como quantidade: metragem quadrada (m²), medidas de largura/profundidade/altura, ou qualquer número de cota do desenho — esses são medidas, não contagem de itens. " +
"Se não for possível contar com confiança, use quantidade 1 e marque estimado como true. " +
"Some as unidades quando houver mais de uma peça idêntica no mesmo ambiente, mas nunca ultrapasse o razoável para o tamanho do ambiente informado. " +
'Quando a planta não tiver uma legenda explícita de quantidade, estime pela geometria/desenho e marque no campo "estimado" como true. ' +
"Responda APENAS com um array JSON, sem texto antes ou depois, sem markdown, no formato: " +
'[{"item":"descrição do móvel","ambiente":"nome do ambiente","quantidade":numero,"estimado":true|false}]',
            },
          ],
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
  path: "/api/interpretar-planta",
};
