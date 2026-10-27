/**
 * Supabase Integration & Dual-Mode Backend Client
 * Allows seamless switching between local SQLite backend (/api) and Supabase Cloud.
 */
const SupabaseService = {
  client: null,
  isConfigured: false,

  init() {
    const url = localStorage.getItem('SUPABASE_URL') || window.SUPABASE_URL || '';
    const key = localStorage.getItem('SUPABASE_ANON_KEY') || window.SUPABASE_ANON_KEY || '';

    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isConfigured = true;
        console.log('[SUPABASE] Initialized cloud client successfully.');
      } catch (err) {
        console.warn('[SUPABASE] Initialization failed:', err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
    }
  },

  async getProfile() {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('profiles')
          .select('*')
          .limit(1)
          .single();
        if (!error && data) return { success: true, data };
      } catch (e) {
        console.warn('[SUPABASE] Fetch profile error, falling back to local:', e);
      }
    }
    // Fallback to local server API
    const res = await fetch('/api/profile');
    return await res.json();
  },

  async updateProfile(profileData) {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('profiles')
          .upsert({ ...profileData, updated_at: new Date().toISOString() })
          .select()
          .single();
        if (!error) return { success: true, data, message: 'Saved to Supabase PostgreSQL' };
      } catch (e) {
        console.warn('[SUPABASE] Save profile error, falling back to local:', e);
      }
    }
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return await res.json();
  },

  async recordRun(runData) {
    if (this.isConfigured && this.client) {
      try {
        await this.client.from('experiment_runs').insert(runData);
      } catch (e) {
        console.warn('[SUPABASE] Run log error:', e);
      }
    }
    const res = await fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runData)
    });
    return await res.json();
  },

  async uploadOutput(expId, fileData) {
    const res = await fetch(`/api/upload_output/${expId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileData)
    });
    return await res.json();
  }
};

window.SupabaseService = SupabaseService;
