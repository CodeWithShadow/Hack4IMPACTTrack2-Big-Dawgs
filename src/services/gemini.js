import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = apiKey ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

const OFFLINE_CACHE_KEY = 'farmflux_gemini_cache';

function getCachedResponse(key) {
    try {
        const cache = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || '{}');
        return cache[key] || null;
    } catch { return null; }
}

function setCachedResponse(key, value) {
    try {
        const cache = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || '{}');
        cache[key] = value;
        const keys = Object.keys(cache);
        if (keys.length > 50) delete cache[keys[0]];
        localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache));
    } catch { /* storage full */ }
}

export async function streamGeminiResponse(prompt, onChunk) {
    const cacheKey = prompt.slice(0, 100);
    if (!navigator.onLine) {
        const cached = getCachedResponse(cacheKey);
        if (cached) { onChunk(cached, true); return cached; }
        throw new Error('Offline and no cached response available.');
    }

    try {
        if (!model) throw new Error('Gemini API key not configured.');
        const result = await model.generateContentStream(prompt);
        let fullText = '';
        for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            onChunk(fullText, false);
        }
        onChunk(fullText, true);
        setCachedResponse(cacheKey, fullText);
        return fullText;
    } catch (err) {
        const cached = getCachedResponse(cacheKey);
        if (cached) { onChunk(cached, true); return cached; }
        throw err;
    }
}

export async function getGeminiJSON(prompt) {
    const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no code blocks, just raw JSON.`;
    if (!model) throw new Error('Gemini API key not configured.');
    const result = await model.generateContent(jsonPrompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
}

/* ─── Specific Prompt Builders ─── */

export async function getTreatmentRecommendation(diseaseName, cropName, onChunk) {
    const prompt = `You are an expert agronomist. A ${cropName} plant has been diagnosed with "${diseaseName}".

Provide a detailed treatment plan including:
1. Immediate actions to take
2. Chemical treatments (specific fungicides/pesticides with application rates)
3. Organic/biological alternatives
4. Prevention strategies for future seasons
5. Expected recovery timeline

Be specific, practical, and include dosage information where applicable. Format with clear headers and bullet points.`;
    return streamGeminiResponse(prompt, onChunk);
}

export async function getCropRecommendationsForSoil(soilType, nutrients, onChunk) {
    const prompt = `You are an expert soil scientist and agronomist. Based on the following soil analysis:
- Soil Type: ${soilType}
- Nutrient Profile: ${JSON.stringify(nutrients)}

Recommend:
1. Top 5 crops best suited for this soil (with reasoning)
2. Fertilizer recommendations (specific products and application rates)
3. Soil amendments needed
4. pH adjustment suggestions
5. Cover crop recommendations for soil health

Be specific and actionable.`;
    return streamGeminiResponse(prompt, onChunk);
}

export async function getYieldPrediction(params, onChunk) {
    const prompt = `You are an agricultural yield prediction expert. Predict the yield for these parameters:
- Crop: ${params.crop}
- Field Size: ${params.fieldSize} hectares
- Soil Type: ${params.soilType}
- Disease Severity: ${params.diseaseSeverity}%
- Irrigation Frequency: ${params.irrigationFreq}
- Location: ${params.location}
- Current Weather: ${JSON.stringify(params.weather)}

Provide:
1. Predicted yield in kg/hectare (give a specific number)
2. Comparison to national average for this crop
3. Top 3 risk factors affecting yield
4. 5 optimization suggestions to improve yield
5. Best harvest window (date range based on current month)
6. Confidence level of prediction

Format clearly with headers and specific numbers.`;
    return streamGeminiResponse(prompt, onChunk);
}

export async function getIrrigationSchedule(params, onChunk) {
    const prompt = `You are an irrigation expert with precision agriculture knowledge. Create an irrigation plan:
- Crop: ${params.crop}
- Field Size: ${params.fieldSize} hectares
- Soil Type: ${params.soilType}
- Location: ${params.location}
- Current Weather: ${JSON.stringify(params.weather)}
- 7-Day Forecast: ${JSON.stringify(params.forecast)}

Provide:
1. Today's recommendation: irrigate yes/no, amount in liters
2. 7-day irrigation schedule (day by day with amounts)
3. Water efficiency tips
4. Estimated water savings vs conventional irrigation (%)
5. Evapotranspiration rate estimate (mm/day)
6. Total water needed for the week in liters

Be precise with numbers and amounts.`;
    return streamGeminiResponse(prompt, onChunk);
}

export async function getMarketplacePriceSuggestion(crop, quantity, location) {
    const prompt = `As an agricultural market analyst, suggest a fair price for:
- Crop: ${crop}
- Quantity: ${quantity}
- Location: ${location}

Return ONLY this JSON: {"suggestedPrice": <number>, "minPrice": <number>, "maxPrice": <number>, "currency": "INR", "reasoning": "<brief reasoning>"}`;
    return getGeminiJSON(prompt);
}

export async function getUrbanFarmingRecommendations(params, onChunk) {
    const prompt = `You are an expert urban farming consultant. Recommend the best crops for this setup:
- City: ${params.city}
- Available Space: ${params.space} sq ft
- Sunlight Hours: ${params.sunlight} hours/day
- Setting: ${params.setting} (indoor/outdoor/balcony)

Provide:
1. Top 5 recommended crops, each with:
   - Growing difficulty (Easy/Medium/Hard)
   - Days to harvest
   - Water needs (Low/Medium/High)
   - Nutritional value highlights
   - Space needed per plant
2. Step-by-step growing guide for each crop
3. Space optimization tips for the setup
4. Nutritional benefits summary
5. Estimated monthly yield

Be detailed and practical for urban settings.`;
    return streamGeminiResponse(prompt, onChunk);
}

/* ─── Multimodal Image Analysis ─── */

export async function analyzeDiseaseImage(imageDataUrl) {
    const [header, base64] = imageDataUrl.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const imagePart = { inlineData: { data: base64, mimeType } };

    const prompt = `You are a world-class expert agronomist and plant pathologist. 
Analyze this image of a plant leaf and identify any diseases present.
If it is a healthy leaf, identify the crop (e.g. "Apple Healthy").
If the image is clearly not a plant or leaf, return "Unknown Object" for className.

Return ONLY valid JSON in exactly this structure:
{
  "topPrediction": { "className": "CropName DiseaseName", "confidence": 0.95 },
  "allPredictions": [
    { "className": "CropName DiseaseName", "confidence": 0.95 },
    { "className": "Alternative Disease", "confidence": 0.05 }
  ],
  "isHealthy": false,
  "treatment": "A detailed 3-step treatment plan if diseased, otherwise a short maintenance tip."
}`;

    if (!model) throw new Error('Gemini API key not configured.');
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
}

export async function analyzeSoilImage(imageDataUrl) {
    const [header, base64] = imageDataUrl.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const imagePart = { inlineData: { data: base64, mimeType } };

    const prompt = `You are an expert soil scientist. 
Analyze this image of soil and estimate its physical properties, type, and composition based on visual texture, color, and structure.

Return ONLY valid JSON in exactly this structure:
{
  "soilType": { "name": "Loamy Soil", "description": "A short 1-sentence description." },
  "confidence": 0.85,
  "composition": { "sand": 40, "silt": 40, "clay": 20, "organic": 5 },
  "phEstimate": "6.0-7.0",
  "nutrients": { "nitrogen": "Medium", "phosphorus": "High", "potassium": "Low", "organic": "Medium" },
  "aiText": "Detailed recommendation on how to improve this soil and what crops might grow best in it."
}`;

    if (!model) throw new Error('Gemini API key not configured.');
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
}
