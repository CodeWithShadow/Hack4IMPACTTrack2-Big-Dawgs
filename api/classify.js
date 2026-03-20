/**
 * Vercel serverless function: proxies plant disease classification requests
 * to the Hugging Face Inference API to avoid CORS issues in production.
 */

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const HF_MODEL = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
    const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
    const HF_TOKEN = process.env.VITE_HF_TOKEN || '';

    try {
        // Collect the binary body
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);

        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/octet-stream',
        };
        if (HF_TOKEN) {
            headers['Authorization'] = `Bearer ${HF_TOKEN}`;
        }

        const hfResponse = await fetch(HF_API_URL, {
            method: 'POST',
            headers,
            body,
        });

        const data = await hfResponse.json();

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.status(hfResponse.status).json(data);
    } catch (error) {
        console.error('HF Proxy error:', error);
        return res.status(500).json({ error: 'Failed to classify image', details: error.message });
    }
}
