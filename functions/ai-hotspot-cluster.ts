import { createClient } from 'npm:@insforge/sdk';

export default async function(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const baseUrl = Deno.env.get('INSFORGE_BASE_URL') || 'https://cr4cnj6i.us-east.insforge.app';
    const anonKey = Deno.env.get('ANON_KEY') || '';

    const client = createClient({ baseUrl, anonKey });

    // Fetch complaints with sub-cases
    const { data: complaints, error } = await client.database
      .from('complaints')
      .select('id, title, area, district, overall_status, created_at')
      .limit(100);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Cluster by area
    const areaMap: Record<string, { count: number; areas: string[]; sampleIssues: string[] }> = {};

    (complaints || []).forEach(c => {
      const area = c.area || 'Unknown';
      if (!areaMap[area]) {
        areaMap[area] = { count: 0, areas: [area], sampleIssues: [] };
      }
      areaMap[area].count++;
      if (areaMap[area].sampleIssues.length < 3) {
        areaMap[area].sampleIssues.push(c.title);
      }
    });

    const clusters = Object.entries(areaMap)
      .map(([area, val]) => {
        let threatLevel = 'Low';
        let rootCause = 'Normal seasonal load';
        if (val.count >= 5) {
          threatLevel = 'Critical';
          rootCause = 'Critical infrastructure failure requiring inter-departmental task force';
        } else if (val.count >= 3) {
          threatLevel = 'High';
          rootCause = 'High recurring complaint density detected in residential perimeter';
        } else if (val.count >= 2) {
          threatLevel = 'Medium';
          rootCause = 'Moderate recurrence requiring preventative maintenance';
        }

        return {
          zone: area,
          incident_count: val.count,
          threat_level: threatLevel,
          root_cause: rootCause,
          sample_issues: val.sampleIssues
        };
      })
      .sort((a, b) => b.incident_count - a.incident_count);

    return new Response(JSON.stringify({
      success: true,
      total_analyzed: (complaints || []).length,
      hotspots: clusters
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Hotspot clustering failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
