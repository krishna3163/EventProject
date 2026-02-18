import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────────
// PARTICIPATION ANALYTICS (stored in Supabase PostgreSQL)
// ─────────────────────────────────────────────────────────────

export const supabaseService = {

    // Log a participation event when a user joins a contest/quiz
    logParticipation: async ({ userId, userEmail, userName, eventId, eventTitle, eventType, orgId, score, maxScore, rank }) => {
        try {
            const { data, error } = await supabase
                .from('participations')
                .upsert({
                    user_id: userId,
                    user_email: userEmail,
                    user_name: userName,
                    event_id: eventId,
                    event_title: eventTitle,
                    event_type: eventType || 'QUIZ',
                    org_id: orgId,
                    score: score || 0,
                    max_score: maxScore || 100,
                    rank: rank || null,
                    participated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,event_id' });
            if (error) console.warn('Supabase logParticipation:', error.message);
            return data;
        } catch (e) {
            console.warn('Supabase unavailable:', e.message);
            return null;
        }
    },

    // Get all participations for a specific user
    getUserParticipations: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('participations')
                .select('*')
                .eq('user_id', userId)
                .order('participated_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn('Supabase getUserParticipations:', e.message);
            return [];
        }
    },

    // Get all participations for events organized by an org
    getOrgParticipations: async (orgId) => {
        try {
            const { data, error } = await supabase
                .from('participations')
                .select('*')
                .eq('org_id', orgId)
                .order('participated_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn('Supabase getOrgParticipations:', e.message);
            return [];
        }
    },

    // Get leaderboard for a specific event
    getEventLeaderboard: async (eventId) => {
        try {
            const { data, error } = await supabase
                .from('participations')
                .select('*')
                .eq('event_id', eventId)
                .order('score', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn('Supabase getEventLeaderboard:', e.message);
            return [];
        }
    },

    // Get platform-wide analytics (for Super Admin)
    getPlatformAnalytics: async () => {
        try {
            const { data: total, error: e1 } = await supabase
                .from('participations')
                .select('event_type', { count: 'exact' });

            const { data: byType, error: e2 } = await supabase
                .from('participations')
                .select('event_type')
                .order('event_type');

            if (e1 || e2) throw e1 || e2;

            const quizCount = byType?.filter(r => r.event_type === 'QUIZ').length || 0;
            const contestCount = byType?.filter(r => r.event_type === 'CONTEST').length || 0;

            return {
                totalParticipations: total?.length || 0,
                quizParticipations: quizCount,
                contestParticipations: contestCount,
            };
        } catch (e) {
            console.warn('Supabase getPlatformAnalytics:', e.message);
            return { totalParticipations: 0, quizParticipations: 0, contestParticipations: 0 };
        }
    },

    // Get top performers across the platform
    getTopPerformers: async (limit = 10) => {
        try {
            const { data, error } = await supabase
                .from('participations')
                .select('user_id, user_name, user_email, score, event_title')
                .order('score', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn('Supabase getTopPerformers:', e.message);
            return [];
        }
    },

    // Get user stats summary
    getUserStats: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('participations')
                .select('score, max_score, event_type, rank')
                .eq('user_id', userId);
            if (error) throw error;

            const participations = data || [];
            const totalScore = participations.reduce((sum, p) => sum + (p.score || 0), 0);
            const avgScore = participations.length > 0 ? Math.round(totalScore / participations.length) : 0;
            const bestRank = participations.reduce((best, p) => p.rank && p.rank < best ? p.rank : best, Infinity);

            return {
                totalParticipations: participations.length,
                quizCount: participations.filter(p => p.event_type === 'QUIZ').length,
                contestCount: participations.filter(p => p.event_type === 'CONTEST').length,
                avgScore,
                bestRank: bestRank === Infinity ? null : bestRank,
            };
        } catch (e) {
            console.warn('Supabase getUserStats:', e.message);
            return { totalParticipations: 0, quizCount: 0, contestCount: 0, avgScore: 0, bestRank: null };
        }
    },
    uploadImage: async (file) => {
        try {
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const { data, error } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (e) {
            console.warn('Supabase uploadImage:', e.message);
            return null;
        }
    },
};

export default supabaseService;
