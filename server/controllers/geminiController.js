const fetch = global.fetch;

const generateGeminiContent = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your .env file.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .join('') || 'No response returned from Gemini.';

  return text;
};

const explainCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code text is required' });
    }

    const result = await generateGeminiContent(`Explain this code in simple language and show the main purpose, key steps, and possible improvements:\n\n${code}`);
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const generateProjectDocumentation = async (req, res) => {
  try {
    const { projectTitle, description } = req.body;

    if (!projectTitle) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const result = await generateGeminiContent(`Create a clean project documentation for this project. Include sections for overview, features, setup, and usage. Project title: ${projectTitle}. Description: ${description || 'No additional description provided.'}`);
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { explainCode, generateProjectDocumentation };
