module.exports = async function(request) {
  const BASE_URL = 'https://q97h29qu.insforge.site';
  const CRON_SECRET = 'souqai-cron-2026';
  
  try {
    const response = await fetch(`${BASE_URL}/api/cron/check-plans?secret=${CRON_SECRET}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      cronResult: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
