export const getEnv = (envname) => {
    const env = import.meta.env;
    let val = env[envname];

    // Automatically fix missing /api suffix for base URL
    if (envname === 'VITE_API_BASE_URL' && val && typeof val === 'string') {
        if (!val.endsWith('/api') && !val.includes('/api/')) {
            val = val.replace(/\/$/, '') + '/api';
        }
    }
    
    return val;
}