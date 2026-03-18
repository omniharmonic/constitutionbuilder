export const TAG_TAXONOMY = {
  identity: {
    vision: ['success_indicators', 'beneficiaries', 'transformed_systems'],
    purpose: ['core_reason', 'unique_role', 'what_draws_people'],
    mission: ['core_activities', 'essential_functions', 'missing_activities'],
    worldview: ['theory_of_change', 'human_nature', 'power_authority', 'paradigm_shift'],
    mandates: ['obligations_to_members', 'obligations_to_communities', 'ethical_boundaries', 'non_negotiables'],
    values: [
      'personal_ethics',
      'personal_ethics.interpersonal',
      'personal_ethics.conflict',
      'personal_ethics.accountability',
      'system_design_ethics',
      'system_design_ethics.principles',
      'system_design_ethics.outcomes_sought',
      'system_design_ethics.outcomes_avoided',
      'core_values_ranked',
    ],
    pledge: ['member_commitments', 'org_commitments', 'accountability_mechanisms'],
  },
  structure: {
    roles: ['permissions', 'responsibilities', 'criteria', 'member_type'],
    membranes: ['functions', 'roles', 'decision_authority', 'relationships'],
    assets: ['type', 'stewardship', 'access_control'],
  },
  protocols: {
    role_protocols: ['add_role', 'remove_role', 'election', 'transition'],
    membrane_protocols: ['decision_making', 'conflict_resolution', 'communication', 'meetings'],
    asset_protocols: ['budget', 'resource_allocation', 'information_security'],
  },
  meta: {
    amendment_process: [],
    review_cadence: [],
    integration_notes: [],
  },
} as const;

// Generate flat list of all valid tags
export function getAllTags(): string[] {
  const tags: string[] = [];

  for (const [section, components] of Object.entries(TAG_TAXONOMY)) {
    for (const [component, subtags] of Object.entries(components)) {
      tags.push(`${section}.${component}`);
      for (const subtag of subtags) {
        tags.push(`${section}.${component}.${subtag}`);
      }
    }
  }

  return tags;
}

// Extract the component (top two levels) from a tag
export function getComponentFromTag(tag: string): string {
  const parts = tag.split('.');
  return parts.slice(0, 2).join('.');
}
