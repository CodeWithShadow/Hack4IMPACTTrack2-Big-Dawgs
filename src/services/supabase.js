import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-env.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-key';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('FarmFlux: Supabase env vars not set. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

/* ─── Auth Helpers ─── */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

export async function ensureUserInDB(user) {
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

    if (!existing) {
        const { error } = await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: new Date().toISOString(),
        });
        if (error && error.code !== '23505') console.error('Error creating user:', error);
    }
}

/* ─── Disease Analyses CRUD ─── */
export async function saveDiseaseAnalysis(data) {
    const { data: result, error } = await supabase.from('disease_analyses').insert(data).select().single();
    if (error) throw error;
    return result;
}

export async function getDiseaseAnalyses(userId, limit = 10) {
    const { data, error } = await supabase
        .from('disease_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}

/* ─── Soil Analyses CRUD ─── */
export async function saveSoilAnalysis(data) {
    const { data: result, error } = await supabase.from('soil_analyses').insert(data).select().single();
    if (error) throw error;
    return result;
}

export async function getSoilAnalyses(userId, limit = 10) {
    const { data, error } = await supabase
        .from('soil_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}

/* ─── Yield Predictions CRUD ─── */
export async function saveYieldPrediction(data) {
    const { data: result, error } = await supabase.from('yield_predictions').insert(data).select().single();
    if (error) throw error;
    return result;
}

export async function getYieldPredictions(userId, limit = 10) {
    const { data, error } = await supabase
        .from('yield_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}

/* ─── Marketplace CRUD ─── */
export async function createListing(data) {
    const { data: result, error } = await supabase.from('marketplace').insert(data).select().single();
    if (error) throw error;
    return result;
}

export async function getListings(filters = {}) {
    let query = supabase.from('marketplace').select('*').order('created_at', { ascending: false });
    if (filters.crop_type) query = query.eq('crop_type', filters.crop_type);
    if (filters.location) query = query.ilike('location', `%${filters.location}%`);
    if (filters.min_price) query = query.gte('price', filters.min_price);
    if (filters.max_price) query = query.lte('price', filters.max_price);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getMyListings(userId) {
    const { data, error } = await supabase
        .from('marketplace')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function deleteListing(id) {
    const { error } = await supabase.from('marketplace').delete().eq('id', id);
    if (error) throw error;
}

/* ─── Disease Alerts CRUD ─── */
export async function createDiseaseAlert(data) {
    const { data: result, error } = await supabase.from('disease_alerts').insert(data).select().single();
    if (error) throw error;
    return result;
}

export async function getDiseaseAlerts(filters = {}) {
    let query = supabase.from('disease_alerts').select('*').order('created_at', { ascending: false });
    if (filters.disease_type) query = query.eq('disease_name', filters.disease_type);
    if (filters.severity) query = query.eq('severity', filters.severity);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function deleteDiseaseAlert(id) {
    const { error } = await supabase.from('disease_alerts').delete().eq('id', id);
    if (error) throw error;
}

/* ─── Irrigation Logs CRUD ─── */
export async function saveIrrigationLog(data) {
    const { data: result, error } = await supabase.from('irrigation_logs').insert(data).select().single();
    if (error) throw error;
    return result;
}

export async function getIrrigationLogs(userId, limit = 10) {
    const { data, error } = await supabase
        .from('irrigation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}

/* ─── Urban Farming CRUD ─── */
export async function saveUrbanFarmingSession(data) {
    const { data: result, error } = await supabase.from('urban_farming').insert(data).select().single();
    if (error) throw error;
    return result;
}

/* ─── Image Upload ─── */
export async function uploadCropImage(userId, file) {
    const timestamp = Date.now();
    const path = `${userId}/${timestamp}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('crop-images')
        .upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('crop-images').getPublicUrl(data.path);
    return urlData.publicUrl;
}

/* ─── User Stats ─── */
export async function getUserStats(userId) {
    const [allDiseases, detectedDiseases, soils, yields, irrigations] = await Promise.all([
        supabase.from('disease_analyses').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('disease_analyses').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_healthy', false),
        supabase.from('soil_analyses').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('yield_predictions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('irrigation_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    // Log errors if any counting queries fail (e.g. missing RLS or tables)
    if (allDiseases.error) console.error("Error counting all diseases:", allDiseases.error);
    if (detectedDiseases.error) console.error("Error counting detected diseases:", detectedDiseases.error);
    if (soils.error) console.error("Error counting soils:", soils.error);
    if (yields.error) console.error("Error counting yields:", yields.error);
    if (irrigations.error) console.error("Error counting irrigations:", irrigations.error);

    return {
        totalAnalyses: (allDiseases.count || 0) + (soils.count || 0),
        diseasesDetected: detectedDiseases.count || 0,
        cropsMonitored: yields.count || 0,
        waterSaved: (irrigations.count || 0) * 150,
    };
}

/* ─── Recent Analyses ─── */
export async function getRecentAnalyses(userId, limit = 5) {
    const [diseaseRes, soilRes] = await Promise.all([
        supabase.from('disease_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
        supabase.from('soil_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
    ]);
    const all = [
        ...(diseaseRes.data || []).map(d => ({ ...d, type: 'disease' })),
        ...(soilRes.data || []).map(s => ({ ...s, type: 'soil' })),
    ];
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return all.slice(0, limit);
}
