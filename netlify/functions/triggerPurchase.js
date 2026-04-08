export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);
    console.log("Received body in Netlify function:", payload);
    
    const forwardedBody = JSON.stringify(payload);
    console.log("Forwarded body to n8n:", forwardedBody);

    // Forward the request to your n8n webhook
    const response = await fetch("http://167.86.88.118:5678/webhook/purchase-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: forwardedBody
    });

    const data = await response.text();
    console.log("n8n response status:", response.status);
    console.log("n8n response text:", data);

    return {
      statusCode: response.status,
      headers,
      body: data
    };
  } catch (error) {
    console.error("Error in triggerPurchase function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to trigger webhook", details: error.message })
    };
  }
};
