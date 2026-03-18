export interface ConstitutionComponent {
  id: string;
  section: 'identity' | 'structure' | 'protocols';
  title: string;
  subtitle: string;
  temporalFocus: string;
  test: string;
  keyQuestions: string[];
}

export const CONSTITUTION_COMPONENTS: ConstitutionComponent[] = [
  // ─── Identity (7 components) ─────────────────────────────
  {
    id: 'identity.vision',
    section: 'identity',
    title: 'Vision',
    subtitle: 'The world you seek to help create',
    temporalFocus: 'Future-facing',
    test: 'If this came true, your organization might no longer be needed.',
    keyQuestions: [
      'Imagine it\'s 20 years from now and your group has been wildly successful. What does the world look like?',
      'What specific changes would you point to as indicators of success?',
      'Who benefits most from this vision becoming reality?',
      'What systems or structures would need to be transformed?',
    ],
  },
  {
    id: 'identity.purpose',
    section: 'identity',
    title: 'Purpose',
    subtitle: 'Why you exist now',
    temporalFocus: 'Timeless, unbounded by metrics',
    test: 'Remains true even if your organizational form evolves.',
    keyQuestions: [
      'Why does this group exist? Not what it does — why.',
      'If all your current activities disappeared but the reason still existed, what would that reason be?',
      'What uniquely positions this group to fulfill this purpose?',
      'What draws people to this group at a deep level?',
    ],
  },
  {
    id: 'identity.mission',
    section: 'identity',
    title: 'Mission',
    subtitle: 'What you do to fulfill your purpose',
    temporalFocus: 'Present and ongoing',
    test: 'Specific enough to guide decisions, broad enough to evolve.',
    keyQuestions: [
      'What does your group actually do day-to-day?',
      'What are the core activities that most directly fulfill your purpose?',
      'What functions are essential that might not be obvious from the outside?',
      'What activities are you not currently doing that you should be?',
    ],
  },
  {
    id: 'identity.worldview',
    section: 'identity',
    title: 'Worldview',
    subtitle: 'Fundamental assumptions about how the world works',
    temporalFocus: 'Present and continuous',
    test: 'Guides your approach even unconsciously.',
    keyQuestions: [
      'How do you think meaningful change happens?',
      'What do you believe about human nature — are people generally cooperative or competitive?',
      'How do you think about power and authority?',
      'Is there a paradigm shift your group is trying to be part of?',
    ],
  },
  {
    id: 'identity.mandates',
    section: 'identity',
    title: 'Mandates',
    subtitle: 'Non-negotiable obligations and ethical boundaries',
    temporalFocus: 'Present and continuous',
    test: 'Would be upheld even in difficult circumstances.',
    keyQuestions: [
      'What is your group obligated to do for its members?',
      'What obligations do you have to the communities you serve?',
      'What would your group never do, even if it seemed to help the mission?',
      'What ethical boundaries are non-negotiable?',
    ],
  },
  {
    id: 'identity.values',
    section: 'identity',
    title: 'Values',
    subtitle: 'Personal Ethics (interpersonal) + System Design Ethics (structural)',
    temporalFocus: 'Present and continuous',
    test: 'If violated, the org would feel out of integrity even if mission succeeded.',
    keyQuestions: [
      'What values guide how your members treat each other?',
      'How does your group handle conflict between members?',
      'When you\'re designing a system or process, what ethical principles guide that design?',
      'Are the values for interpersonal behavior different from the values for system design?',
    ],
  },
  {
    id: 'identity.pledge',
    section: 'identity',
    title: 'Pledge',
    subtitle: 'Mutual commitments between members and organization',
    temporalFocus: 'Present and continuous',
    test: 'Remains true even as the org evolves.',
    keyQuestions: [
      'What do members promise when they join?',
      'What does the group promise to its members in return?',
      'How is that mutual commitment upheld and enforced?',
    ],
  },

  // ─── Structure (3 component types) ───────────────────────
  {
    id: 'structure.roles',
    section: 'structure',
    title: 'Roles',
    subtitle: 'Defined positions with specific rights and responsibilities',
    temporalFocus: 'Ongoing',
    test: 'Each role has clear permissions, responsibilities, and criteria.',
    keyQuestions: [
      'Who does what in your group? What are the key roles?',
      'What permissions does each role have? What can they decide on their own?',
      'How does someone get into a role? How do they leave?',
      'Do you have different types of membership (leadership, core, network)?',
    ],
  },
  {
    id: 'structure.membranes',
    section: 'structure',
    title: 'Membranes',
    subtitle: 'Organizational units or circles with defined boundaries',
    temporalFocus: 'Ongoing',
    test: 'Each membrane has clear functions, authority, and relationships.',
    keyQuestions: [
      'Does your group organize into distinct teams or circles for different functions?',
      'How do those teams relate to each other?',
      'What decisions can each team make on its own vs. what requires broader approval?',
      'Think of it like organs in a body — what are the distinct "organs" of your group?',
    ],
  },
  {
    id: 'structure.assets',
    section: 'structure',
    title: 'Assets',
    subtitle: 'Resources the organization stewards',
    temporalFocus: 'Ongoing',
    test: 'All assets have clear stewardship and access policies.',
    keyQuestions: [
      'What does your group collectively manage? Money, information, tools, IP, physical space?',
      'Who manages those resources? How are decisions made about their use?',
      'What happens to shared resources if the group changes significantly?',
    ],
  },

  // ─── Protocols (3 categories) ────────────────────────────
  {
    id: 'protocols.role',
    section: 'protocols',
    title: 'Role Protocols',
    subtitle: 'How roles are assigned, transitioned, and removed',
    temporalFocus: 'Ongoing',
    test: 'Clear processes for every role lifecycle event.',
    keyQuestions: [
      'A new person wants to take on a leadership role. How does that work?',
      'Someone isn\'t fulfilling their responsibilities. What\'s the process?',
      'A long-time leader wants to step down. What happens?',
    ],
  },
  {
    id: 'protocols.membrane',
    section: 'protocols',
    title: 'Membrane Protocols',
    subtitle: 'Decision-making, conflict resolution, communication',
    temporalFocus: 'Ongoing',
    test: 'Clear processes for coordination within and between teams.',
    keyQuestions: [
      'Your group needs to make a major strategic decision. How do you make it?',
      'Two members fundamentally disagree about a budget allocation. Walk me through what happens.',
      'How does your group communicate — meetings, async, decisions?',
      'Your group grows from 10 to 50 people. What changes? What stays the same?',
    ],
  },
  {
    id: 'protocols.asset',
    section: 'protocols',
    title: 'Asset Protocols',
    subtitle: 'Budget, resource allocation, information security',
    temporalFocus: 'Ongoing',
    test: 'Clear processes for managing every type of asset.',
    keyQuestions: [
      'How are budget decisions made? Who has spending authority?',
      'How do you handle sensitive information?',
      'Has your group ever disagreed about how to use resources? What happened?',
    ],
  },
];

export const IDENTITY_COMPONENTS = CONSTITUTION_COMPONENTS.filter(c => c.section === 'identity');
export const STRUCTURE_COMPONENTS = CONSTITUTION_COMPONENTS.filter(c => c.section === 'structure');
export const PROTOCOL_COMPONENTS = CONSTITUTION_COMPONENTS.filter(c => c.section === 'protocols');

export function getComponentById(id: string): ConstitutionComponent | undefined {
  return CONSTITUTION_COMPONENTS.find(c => c.id === id);
}
