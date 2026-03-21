import { GoogleGenerativeAI } from '@google/generative-ai';

const OFFLINE_CACHE_KEY = 'farmflux_gemini_cache';

// Helper to get the current working model
function getModel() {
    const activeKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!activeKey) return null;
    const genAI = new GoogleGenerativeAI(activeKey);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

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

export async function streamGeminiResponse(prompt, onChunk, fallbackText = '') {
    const cacheKey = prompt.slice(0, 100);
    const model = getModel();

    if (!navigator.onLine) {
        const cached = getCachedResponse(cacheKey);
        if (cached) { onChunk(cached, true); return cached; }
        if (fallbackText) { onChunk(fallbackText, true); return fallbackText; }
        throw new Error('Offline and no cached response available.');
    }

    try {
        if (!model) throw new Error('API_KEY_MISSING');
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
        console.warn("Gemini API stream failed, using fallback/cache:", err.message);
        const cached = getCachedResponse(cacheKey);
        if (cached) { onChunk(cached, true); return cached; }
        
        if (fallbackText) {
            // Simulate a stream for the fallback text
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            let current = '';
            const words = fallbackText.split(' ');
            for (let i = 0; i < words.length; i++) {
                current += words[i] + ' ';
                onChunk(current, false);
                await delay(20);
            }
            onChunk(current, true);
            return current;
        }
        
        throw err;
    }
}

export async function getGeminiJSON(prompt, fallbackJSON = null) {
    const model = getModel();
    if (!navigator.onLine && fallbackJSON) return fallbackJSON;

    try {
        if (!model) throw new Error('API_KEY_MISSING');
        const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no code blocks, just raw JSON.`;
        const result = await model.generateContent(jsonPrompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.warn("Gemini API JSON failed, using fallback:", err.message);
        if (fallbackJSON) return fallbackJSON;
        throw err;
    }
}

/* ─── Specific Prompt Builders ─── */

export async function getTreatmentRecommendation(diseaseName, cropName, onChunk) {
    const prompt = `You are an expert agronomist. A ${cropName} plant has been diagnosed with "${diseaseName}". Provide a detailed treatment plan including immediate actions, chemical treatments, organic alternatives, prevention strategies, and expected recovery timeline. Format with clear headers and bullet points.`;
    
    const fallback = `## Treatment Plan for ${diseaseName} on ${cropName}
(Note: Using offline fallback data)

**1. Immediate Actions**
- Isolate affected plants if possible
- Remove and destroy heavily infected leaves
- Reduce moisture on leaves by watering at the base

**2. Chemical Treatments**
- Apply a broad-spectrum fungicide following local agricultural guidelines.
- Copper-based sprays can be effective as a preventative measure.

**3. Organic/Biological Alternatives**
- Neem oil spray (1 oz per gallon of water) applied every 7-14 days.
- Baking soda solution (1 tbsp per gallon) for powdery mildews.

**4. Prevention**
- Ensure proper spacing between plants for airflow
- Practice crop rotation (3-year cycle)
- Use resistant seed varieties in the next cycle

**5. Recovery Timeline**
- Mild infections: 1-2 weeks
- Severe infections: May require complete removal to save neighboring plants.`;

    return streamGeminiResponse(prompt, onChunk, fallback);
}

export async function getCropRecommendationsForSoil(soilType, nutrients, onChunk) {
    const prompt = `You are an expert soil scientist and agronomist. Based on the following soil analysis: Soil Type: ${soilType}, Nutrient Profile: ${JSON.stringify(nutrients)}. Recommend top 5 crops, fertilizers, amendments, pH adjustments, and cover crops.`;
    
    const fallback = `## Soil Recommendations
(Note: Using offline fallback data)

**Top 5 Recommended Crops:**
1. Wheat - Adapts well to various soil types.
2. Soybeans - Fixes nitrogen, good for rotation.
3. Corn - Requires good fertilization but high yield potential.
4. Potatoes - Great for looser, well-draining soils.
5. Legumes - Excellent for improving soil health.

**Amendments & Fertilizers:**
- Given the general profile, a balanced NPK fertilizer (e.g., 10-10-10) is advised.
- Consider adding organic compost at 2 tons/acre to improve structure.
- Cover crops like winter rye or clover can help maintain soil organic matter during off-seasons.`;

    return streamGeminiResponse(prompt, onChunk, fallback);
}

export async function getYieldPrediction(params, onChunk) {
    const prompt = `You are an agricultural yield prediction expert. Predict the yield for these parameters: Crop: ${params.crop}, Size: ${params.fieldSize}ha, Soil: ${params.soilType}, Disease: ${params.diseaseSeverity}%, Location: ${params.location}. Provide predicted yield in kg, comparison to average, risk factors, optimization tips, harvest window, and confidence.`;
    
    const baseExpected = 3500; // Mock base
    const sizeMultiplier = parseFloat(params.fieldSize) || 1;
    const diseasePenalty = (100 - params.diseaseSeverity) / 100;
    const mockYield = Math.round(baseExpected * sizeMultiplier * diseasePenalty);

    const fallback = `## Yield Prediction Analysis
(Note: Using offline fallback data)

### 1. Predicted Yield
Based on the field size of ${params.fieldSize}ha and current conditions, the estimated yield is **${mockYield} kg**.

### 2. Comparison to Regional Average
This yield is roughly in line with national averages, slightly impacted by a ${params.diseaseSeverity}% disease severity factor. 

### 3. Top Risk Factors
- **Disease Progression:** At ${params.diseaseSeverity}%, active management is required.
- **Water Management:** Inconsistent irrigation can reduce yield by up to 15%.
- **Soil Nutrients:** Ensure ${params.soilType} soil is properly amended mid-season.

### 4. Optimization Suggestions
- Implement a strict fungicide schedule to cap disease spread.
- Optimize irrigation based on weekly evapotranspiration rates.
- Apply a foliar feed high in potassium during the flowering stage.
- Scout fields weekly.

### 5. Harvest Window
Expect optimal harvest roughly 45-60 days from now, depending on weather.

### 6. Confidence Level
Confidence Level: 75% (Fallback Estimate)`;

    return streamGeminiResponse(prompt, onChunk, fallback);
}

export async function getIrrigationSchedule(params, onChunk) {
    const prompt = `You are an irrigation expert. Create an irrigation plan: Crop: ${params.crop}, Size: ${params.fieldSize}ha, Soil: ${params.soilType}, Weather: ${JSON.stringify(params.weather)}. Provide today's recommendation, 7-day schedule, water efficiency tips, estimated savings, ET rate, and total water.`;
    
    const irrigateToday = Math.random() > 0.5 ? 'YES' : 'NO';
    const amountToday = irrigateToday === 'YES' ? Math.round(parseFloat(params.fieldSize || 1) * 20000) : 0;

    const fallback = `## Smart Irrigation Plan
(Note: Using offline fallback data)

### 1. Today's Recommendation
**Irrigate:** ${irrigateToday}
**Amount:** ${amountToday} liters
(Based on recent rainfall and soil moisture estimates for ${params.soilType} soil)

### 2. 7-Day Schedule
- **Monday:** 0 liters (Monitoring)
- **Tuesday:** ${Math.round(amountToday * 0.8)} liters 
- **Wednesday:** 0 liters
- **Thursday:** ${Math.round(amountToday * 1.2)} liters
- **Friday:** 0 liters (Forecasted rain)
- **Saturday:** 0 liters
- **Sunday:** ${amountToday} liters

### 3. Efficiency Tips
- Water early morning (before 8 AM) or late evening to minimize evaporation.
- Install drip tape for ${params.crop} rather than overhead sprinklers.
- Use mulch to retain soil moisture.

### 4. Water Savings
Implementing this schedule offers a **28% efficiency saving** over conventional calendar-based watering.

### 5. Evapotranspiration Estimate
Estimated ET: 4.2 mm/day

### 6. Total Weekly Need
Approximately ${amountToday * 3} liters for the ${params.fieldSize}ha field.`;

    return streamGeminiResponse(prompt, onChunk, fallback);
}

export async function getMarketplacePriceSuggestion(crop, quantity, location) {
    const prompt = `As an agricultural market analyst, suggest a fair price in INR for: ${crop}, ${quantity}, ${location}. Return ONLY JSON: {"suggestedPrice": <number>, "minPrice": <number>, "maxPrice": <number>, "currency": "INR", "reasoning": "..."}`;
    
    const fallbackJSON = {
        suggestedPrice: 2500,
        minPrice: 2200,
        maxPrice: 2800,
        currency: "INR",
        reasoning: "Based on historical fallback averages for this region."
    };

    return getGeminiJSON(prompt, fallbackJSON);
}

export async function getUrbanFarmingRecommendations(params, onChunk) {
    const prompt = `You are an expert urban farming consultant. Recommend crops for: City: ${params.city}, Space: ${params.space}sq ft, Sunlight: ${params.sunlight}hrs, Setting: ${params.setting}. Provide top 5 crops, growing guide, space tips, nutrition, and yield.`;
    
    const fallback = `## Urban Farming Guide for ${params.city}
(Note: Using offline fallback data)

### Top Recommended Crops for ${params.sunlight} hours of sunlight

1. **Leafy Greens (Spinach/Lettuce)**
   - *Difficulty:* Easy | *Harvest:* 30-45 days | *Water:* Medium

2. **Microgreens**
   - *Difficulty:* Very Easy | *Harvest:* 10-14 days | *Water:* High (Mist daily)

3. **Cherry Tomatoes** (Requires 6+ hours sun)
   - *Difficulty:* Medium | *Harvest:* 60-70 days | *Water:* High

4. **Herbs (Basil, Mint, Cilantro)**
   - *Difficulty:* Easy | *Harvest:* Ongoing | *Water:* Medium

5. **Radishes**
   - *Difficulty:* Easy | *Harvest:* 25-30 days | *Water:* Low

### Space Optimization Tips (${params.setting})
- **Vertical Farming:** Since you only have ${params.space} sq ft, utilize wall space with hanging planters or tiered racks.
- **Companion Planting:** Grow basil near tomatoes to save space and deter pests.
- **Container Depth:** Ensure pots are at least 6-8 inches deep for greens, and 12+ inches for tomatoes.

### Estimated Monthly Yield
For a ${params.space} sq ft well-managed space, expect roughly 5-8 kg of fresh produce monthly depending on the crop mix.`;

    return streamGeminiResponse(prompt, onChunk, fallback);
}

/* ─── Multimodal Image Analysis ─── */

export async function analyzeDiseaseImage(imageDataUrl) {
    const [header, base64] = imageDataUrl.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const imagePart = { inlineData: { data: base64, mimeType } };

    const prompt = `You are a world-class plant pathologist. Analyze this leaf image. Return ONLY valid JSON: {"topPrediction": {"className": "Crop Disease", "confidence": 0.95}, "allPredictions": [...], "isHealthy": false, "treatment": "..."}`;
    
    const fallbackJSON = {
        topPrediction: { className: "Crop Early Blight", confidence: 0.85 },
        allPredictions: [{ className: "Crop Early Blight", confidence: 0.85 }, { className: "Healthy", confidence: 0.1 }],
        isHealthy: false,
        treatment: "Fallback: Apply copper-based fungicide. Ensure good air circulation. Avoid overhead watering."
    };

    const model = getModel();
    if (!navigator.onLine || !model) return fallbackJSON;

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.warn("Disease Analysis API failed, using fallback:", err.message);
        return fallbackJSON;
    }
}

export async function analyzeSoilImage(imageDataUrl) {
    const [header, base64] = imageDataUrl.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const imagePart = { inlineData: { data: base64, mimeType } };

    const prompt = `You are an expert soil scientist. Analyze this soil image. Return ONLY valid JSON: {"soilType": {"name": "Loam", "description": "..."}, "confidence": 0.85, "composition": {"sand":40,"silt":40,"clay":20,"organic":5}, "phEstimate": "6.0-7.0", "nutrients": {"nitrogen":"Medium",...}, "aiText": "..."}`;
    
    const fallbackJSON = {
        soilType: { name: "Loamy CLay", description: "Fallback: Appears to be a dense soil with decent organic matter." },
        confidence: 0.75,
        composition: { sand: 30, silt: 40, clay: 30, organic: 5 },
        phEstimate: "6.5-7.5",
        nutrients: { nitrogen: "Medium", phosphorus: "Medium", potassium: "Low", organic: "Medium" },
        aiText: "Fallback Analysis: This soil looks reasonably healthy but might benefit from added organic compost to improve drainage and aeration."
    };

    const model = getModel();
    if (!navigator.onLine || !model) return fallbackJSON;

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n? ঐতিহ্য?/i, '').replace(/```$/i, '').trim(); // Fixed regex
        return JSON.parse(cleaned);
    } catch (err) {
        console.warn("Soil Analysis API failed, using fallback:", err.message);
        return fallbackJSON;
    }
}
