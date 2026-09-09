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
    const body = await req.json();
    const { title = '', description = '', target_deadline: _target_deadline } = body;
    const combined = `${title} ${description}`.toLowerCase();

    // Default sequential milestones based on domain rules
    const tasks = [];
    let seq = 1;

    // Phase 1: Site inspection
    tasks.push({
      sequence_index: seq++,
      task_name: 'Joint Rapid Reconnaissance & Baseline Audit',
      department_code: 'MUN',
      department_name: 'Municipality',
      estimated_days: 2
    });

    if (combined.includes('road') || combined.includes('pothole') || combined.includes('highway') || combined.includes('pavement')) {
      tasks.push({
        sequence_index: seq++,
        task_name: 'Bitumen Resurfacing & Pothole Patchwork Execution',
        department_code: 'RDH',
        department_name: 'Roads & Highways',
        estimated_days: 5
      });
    }

    if (combined.includes('light') || combined.includes('electric') || combined.includes('cable') || combined.includes('lamp')) {
      tasks.push({
        sequence_index: seq++,
        task_name: 'Smart Streetlight Grid Restoration & Cable Inspection',
        department_code: 'ELE',
        department_name: 'Electrical',
        estimated_days: 3
      });
    }

    if (combined.includes('water') || combined.includes('drain') || combined.includes('pipe') || combined.includes('flood') || combined.includes('monsoon')) {
      tasks.push({
        sequence_index: seq++,
        task_name: 'Stormwater Culvert Desilting & Pipeline Pressure Validation',
        department_code: 'WTR',
        department_name: 'Water Supply',
        estimated_days: 4
      });
    }

    if (combined.includes('waste') || combined.includes('garbage') || combined.includes('clean') || combined.includes('sanitation')) {
      tasks.push({
        sequence_index: seq++,
        task_name: 'Biowaste Clearance & Anti-Larval Sanitation Fogging',
        department_code: 'SAN',
        department_name: 'Sanitation',
        estimated_days: 2
      });
    }

    // Final compliance certification
    tasks.push({
      sequence_index: seq++,
      task_name: 'Collectorate Verification & Compliance Sign-off',
      department_code: 'MUN',
      department_name: 'Municipality',
      estimated_days: 1
    });

    return new Response(JSON.stringify({
      data: {
        title,
        task_count: tasks.length,
        tasks
      },
      success: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to extract gov order tasks' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
