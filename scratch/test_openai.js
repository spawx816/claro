const apiKey = process.env.OPENAI_API_KEY || '';

async function testOpenAI() {
  console.log("Testing OpenAI API Key...");
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ OpenAI API Key valid! Available models count:", data.data?.length);
    } else {
      console.error("❌ OpenAI API Error:", data);
    }
  } catch (err) {
    console.error("❌ Network Error:", err.message);
  }
}

async function testAssistant() {
  console.log("Fetching Assistants list...");
  try {
    const res = await fetch('https://api.openai.com/v1/assistants', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ Assistants list:", data.data?.map(a => ({ id: a.id, name: a.name })));
    } else {
      console.error("Assistants API Info:", data);
    }
  } catch (err) {
    console.error("Assistants error:", err.message);
  }
}

async function main() {
  await testOpenAI();
  await testAssistant();
}

main();
