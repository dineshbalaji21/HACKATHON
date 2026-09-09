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
    const apiKey = Deno.env.get('INSFORGE_API_KEY');

    // If apiKey is available, run privileged query, otherwise anon
    const client = createClient({
      baseUrl,
      anonKey: apiKey || Deno.env.get('ANON_KEY')
    });

    const nowIso = new Date().toISOString();

    // Query pending/in-progress subcases that passed their deadline
    const { data: overdueTickets, error: fetchErr } = await client.database
      .from('complaint_sub_cases')
      .select('id, complaint_id, issue_title, priority, risk_score, department_id, assigned_officer_id')
      .in('status', ['Pending', 'In Progress'])
      .lt('sla_deadline', nowIso);

    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let escalatedCount = 0;
    if (overdueTickets && overdueTickets.length > 0) {
      for (const ticket of overdueTickets) {
        // Elevate risk score and mark overdue
        await client.database
          .from('complaint_sub_cases')
          .update({
            status: 'Overdue',
            risk_score: Math.min(100, (ticket.risk_score || 35) + 25),
            updated_at: nowIso
          })
          .eq('id', ticket.id);

        escalatedCount++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scanned_at: nowIso,
      escalated_count: escalatedCount,
      overdue_tickets: overdueTickets || []
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Daemon check failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
