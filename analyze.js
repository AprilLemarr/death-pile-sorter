const Anthropic = require("@anthropic-ai/sdk");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { imageData } = JSON.parse(event.body);

    if (!imageData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image data provided" }),
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key not configured" }),
      };
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageData,
              },
            },
            {
              type: "text",
              text: `Analyze this clothing item QUICKLY. Give me:
1. Brand (or best guess)
2. Item type (shirt, sweater, dress, etc)
3. Color(s)
4. Size
5. Condition (new with tag, excellent, good, fair, worn)

Be concise. One line per field. If you can't see it clearly, ask ONE specific question.`,
            },
          ],
        },
      ],
    });

    const analysis = response.content[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ analysis }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Analysis failed" }),
    };
  }
};
