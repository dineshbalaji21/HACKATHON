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
    const { title = '', description = '', voice_transcript = '', location = '' } = body;
    const combinedText = `${title} ${description} ${voice_transcript}`.toLowerCase();

    // Department detector patterns
    const deptKeywords = {
      SAN: {
        code: 'SAN',
        name: 'Sanitation',
        terms: ['garbage', 'waste', 'trash', 'dump', 'overflow', 'smell', 'stench', 'drain clean', 'litter', 'dead animal', 'bio waste']
      },
      ELE: {
        code: 'ELE',
        name: 'Electrical',
        terms: ['light', 'lamp', 'streetlight', 'wire', 'cable', 'transformer', 'shock', 'spark', 'blackout', 'power', 'pole']
      },
      RDH: {
        code: 'RDH',
        name: 'Roads & Highways',
        terms: ['pothole', 'road', 'asphalt', 'crater', 'pavement', 'footpath', 'sidewalk', 'tar', 'speed breaker', 'divider']
      },
      WTR: {
        code: 'WTR',
        name: 'Water Supply',
        terms: ['water', 'pipe', 'leak', 'burst', 'drainage', 'sewer', 'sewerage', 'drinking water', 'manhole', 'flooding', 'contamination']
      },
      MUN: {
        code: 'MUN',
        name: 'Municipality',
        terms: ['encroachment', 'building', 'license', 'permit', 'noise', 'stray dog', 'tree', 'park', 'playground', 'market']
      }
    };

    const detectedDepts: Array<{ code: string; name: string; matchedTerms: string[] }> = [];

    for (const [code, info] of Object.entries(deptKeywords)) {
      const matched = info.terms.filter(term => combinedText.includes(term));
      if (matched.length > 0) {
        detectedDepts.push({ code, name: info.name, matchedTerms: matched });
      }
    }

    if (detectedDepts.length === 0) {
      detectedDepts.push({ code: 'MUN', name: 'Municipality', matchedTerms: ['general civic issue'] });
    }

    const isMultiIssue = detectedDepts.length > 1;

    // Severity & urgency scoring
    let basePriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    let baseSlaHours = 48;
    let baseRisk = 35;
    const riskFactors: Array<{ factor_name: string; score_impact: number }> = [];

    const criticalTerms = ['spark', 'shock', 'fire', 'burst', 'accident', 'injury', 'danger', 'hazard', 'severe', 'hospital', 'open manhole', 'school'];
    const highTerms = ['overflow', 'flooding', 'blackout', 'blocked', 'contaminated', 'broken pole', 'massive'];

    const hasCritical = criticalTerms.some(t => combinedText.includes(t));
    const hasHigh = highTerms.some(t => combinedText.includes(t));

    if (hasCritical) {
      basePriority = 'Critical';
      baseSlaHours = 12;
      baseRisk = 85;
      riskFactors.push({ factor_name: 'Immediate Safety Hazard or Exposure', score_impact: 40 });
    } else if (hasHigh || isMultiIssue) {
      basePriority = 'High';
      baseSlaHours = 24;
      baseRisk = 65;
      riskFactors.push({ factor_name: isMultiIssue ? 'Multi-Department Complexity' : 'High Public Disruption', score_impact: 25 });
    } else {
      riskFactors.push({ factor_name: 'Standard Municipal Grievance', score_impact: 10 });
    }

    if (location && location.toLowerCase().includes('main')) {
      baseRisk = Math.min(100, baseRisk + 10);
      riskFactors.push({ factor_name: 'Arterial / Commercial Transit Zone', score_impact: 10 });
    }

    // Generate sub-cases
    const now = new Date();
    const subCases = detectedDepts.map((d, index) => {
      const suffix = String.fromCharCode(65 + index); // A, B, C...
      const deadline = new Date(now.getTime() + baseSlaHours * 60 * 60 * 1000).toISOString();
      const resolutionText = baseSlaHours <= 12 ? '12 Hours' : baseSlaHours <= 24 ? '24 Hours' : `${Math.round(baseSlaHours / 24)} Days`;

      return {
        sub_case_suffix: suffix,
        issue_title: `${d.name}: ${title}`,
        department_code: d.code,
        department_name: d.name,
        category: d.name,
        priority: basePriority,
        sla_deadline: deadline,
        expected_resolution_text: resolutionText,
        risk_score: Math.min(100, baseRisk),
        detected_keywords: d.matchedTerms
      };
    });

    const responseData = {
      is_multi_issue: isMultiIssue,
      primary_category: detectedDepts[0]?.name || 'Municipality',
      priority: basePriority,
      overall_risk_score: Math.min(100, baseRisk),
      risk_factors: riskFactors,
      sub_cases: subCases,
      ai_summary: `AI classified ${detectedDepts.length} civic operational unit(s): ${detectedDepts.map(d => d.name).join(', ')}. Assigned priority: ${basePriority}.`
    };

    return new Response(JSON.stringify({ data: responseData, success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to analyze complaint' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
