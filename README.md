# Constitution Builder

AI-guided collaborative constitution creation for organizations. Built by omniharmonic based on the OpenCivics Solidarity Network Constitution template.

Constitution Builder replaces the multi-week, facilitator-dependent, document-heavy process of writing an organizational constitution with an AI-guided conversational experience. A Claude-powered agent interviews each participant individually, extracts structured governance insights, synthesizes them into a draft constitution, then guides participants through iterative feedback until the group converges.

**Live at [constitutionbuilder.xyz](https://constitutionbuilder.xyz)**

---

## How It Works

Constitution Builder is built on the **Solidarity Network Constitution** template — a comprehensive framework covering Identity, Structure, and Protocols. The tool follows a four-phase cycle:

### Phase 1: Survey — "Lay the Foundation"

An admin creates a session and shares a link with participants. Each participant has a 1:1 conversation with the **Constitutional Architect** — a Claude-powered facilitator that understands the full governance framework.

The agent doesn't ask survey questions. It has a real conversation: starting with personal stories, drawing out values through narrative, using scenarios to surface protocol instincts, and gently separating conflated concepts (like Purpose vs. Mission, or Values vs. Mandates).

Every substantive response is automatically tagged by a second AI agent into a structured taxonomy of 50+ constitutional components — vision, purpose, worldview, roles, decision-making protocols, asset stewardship, and more.

### Phase 2: Draft — "Raise the Frame"

When the admin is ready, they trigger draft generation. Claude Opus processes each constitution component independently — synthesizing multiple participants' insights into authoritative constitutional language. Where participants agree, the draft speaks confidently. Where they disagree, it surfaces the tension explicitly rather than smoothing it over.

The admin can monitor coverage (which components have input from which participants) and review individual tagged responses before generating.

### Phase 3: Feedback — "Review the Plans"

The draft is distributed to participants, who review it in a split-view interface (chat on one side, draft on the other). A **Feedback Agent** walks each participant through the document section by section, collecting reactions classified as agreement, disagreement, suggestion, question, or concern.

### Phase 4: Synthesis & Finalization — "Set the Keystone"

A **Synthesis Agent** (Claude Opus) processes all feedback, revising sections where feedback warrants changes and flagging irreconcilable tensions for group discussion. The cycle can repeat (feedback → synthesis → feedback) until the group converges.

When ready, the admin finalizes the constitution — locking the document and distributing the final version to all participants.

---

## The Constitution Framework

Constitution Builder is built on the **OpenCivics Solidarity Network Constitution** template — a governance framework designed for networks, cooperatives, DAOs, community organizations, and any group that needs to articulate how it governs itself. The framework has three sections, each answering a different foundational question.

### Section 1: Identity — "Who are we?"

Identity defines the group's reason for being, its beliefs, and its commitments. It contains seven components, ordered by the recommended development sequence:

| Component | What It Defines | Key Question | Litmus Test |
|-----------|----------------|--------------|-------------|
| **Vision** | The world the group seeks to help create | "If you were wildly successful in 20 years, what would the world look like?" | If this came true, the organization might no longer be needed |
| **Purpose** | Why the group exists — existential, not functional | "If all your activities disappeared but the *reason* still existed, what would that reason be?" | Remains true even if the organization's form evolves completely |
| **Mission** | What the group does to fulfill its purpose | "What are the core activities that most directly serve your purpose?" | Specific enough to guide decisions, broad enough to evolve |
| **Worldview** | Fundamental assumptions about how the world works | "How do you think meaningful change happens?" | Guides the group's approach even when no one is explicitly thinking about it |
| **Mandates** | Non-negotiable obligations and ethical boundaries | "What would your group *never* do, even if it seemed to help the mission?" | Would be upheld even in the most difficult circumstances |
| **Values** | What the group stands for, split into two domains | "How do members treat each other?" and "What ethical principles guide your system design?" | If violated, the group would feel out of integrity even if the mission succeeded |
| **Pledge** | Mutual commitments between members and organization | "What do members promise when they join?" and "What does the group owe its members?" | Remains true even as the organization evolves |

**Critical design notes:**

- **Purpose ≠ Mission.** Purpose is *why* (existential, timeless). Mission is *what* (functional, present). Most people conflate these. The conversation agent is specifically trained to gently separate them through dialogue, not correction.

- **Values has two sub-domains** that most groups have never distinguished: **Personal Ethics** (how members treat each other — interpersonal behavior, conflict handling, accountability) and **System Design Ethics** (what ethical principles guide the design of systems, processes, and interventions). This distinction is one of the most intellectually productive parts of the template.

- **Mandates are not values.** Values are aspirational; mandates are binding. "We value transparency" is a value. "We will never share personal information about people we serve" is a mandate. The agent probes for both.

### Section 2: Structure — "How are we organized?"

Structure defines the organizational architecture — who does what, how the group is subdivided, and what resources it stewards.

| Component | What It Defines | Why It Matters |
|-----------|----------------|----------------|
| **Roles** | Defined positions with specific permissions, responsibilities, criteria, and member types (Leadership / Council / Core / Network) | Most groups have informal roles but haven't articulated what each role can and can't do. Making this explicit prevents power concentration and confusion. |
| **Membranes** | Organizational units or "circles" with defined boundaries, functions, and decision-making authority | Borrowed from living systems theory. Most groups organize into teams but haven't defined the *boundaries* between them — what each team controls, how teams coordinate, and what requires cross-team approval. |
| **Assets** | Resources the organization stewards — financial, informational, intellectual property, and physical | Groups often forget to govern their collective resources until a conflict arises. Defining stewardship, access, and disposal policies prevents resource conflicts. |

**Scaffolding strategy:** Most participants think naturally about Roles ("who does what"). Few think in terms of Membranes or Assets without prompting. The conversation agent scaffolds from concrete (Roles) to abstract (Membranes, Assets), introducing the membrane concept through analogy: "Think of it like different organs in a body — each has a specific function and defined relationships with others."

### Section 3: Protocols — "How do we operate?"

Protocols are the processes that make governance real. Identity says *who you are*, Structure says *how you're organized*, and Protocols say *what happens when*.

| Category | Examples | How the Agent Surfaces Them |
|----------|---------|---------------------------|
| **Role Protocols** | Adding/removing roles, elections, transitions, succession | "A new person wants to take on a leadership role. How does that work?" |
| **Membrane Protocols** | Decision-making, conflict resolution, communication, meetings | "Two members fundamentally disagree about a budget allocation. Walk me through what happens." |
| **Asset Protocols** | Budget management, resource allocation, information security | "How are spending decisions made? Who has authority over what?" |

**Key insight:** The agent uses **scenario-based elicitation**, not definitions. "Describe your conflict resolution protocol" produces abstract, aspirational answers. "Walk me through what happens when two members disagree about money" produces concrete, honest answers that reveal how the group *actually* operates — which is what a constitution needs to capture.

### How Tagging Maps to the Framework

Every substantive response from a participant is tagged into a hierarchical taxonomy that mirrors the constitution structure. A single participant statement can produce multiple tags — for example, a story about a budget conflict might simultaneously tag to:

- `identity.values.personal_ethics.conflict` (how the members treated each other)
- `protocols.membrane_protocols.conflict_resolution` (the process they followed)
- `identity.mandates.ethical_boundaries` (a boundary that was tested)
- `structure.assets` (the resource in question)

The full taxonomy has 50+ tags across three levels:

```
identity.vision
  identity.vision.success_indicators
  identity.vision.beneficiaries
  identity.vision.transformed_systems

identity.purpose
  identity.purpose.core_reason
  identity.purpose.unique_role
  identity.purpose.what_draws_people

identity.mission
  identity.mission.core_activities
  identity.mission.essential_functions
  identity.mission.missing_activities

identity.worldview
  identity.worldview.theory_of_change
  identity.worldview.human_nature
  identity.worldview.power_authority
  identity.worldview.paradigm_shift

identity.mandates
  identity.mandates.obligations_to_members
  identity.mandates.obligations_to_communities
  identity.mandates.ethical_boundaries
  identity.mandates.non_negotiables

identity.values
  identity.values.personal_ethics
    identity.values.personal_ethics.interpersonal
    identity.values.personal_ethics.conflict
    identity.values.personal_ethics.accountability
  identity.values.system_design_ethics
    identity.values.system_design_ethics.principles
    identity.values.system_design_ethics.outcomes_sought
    identity.values.system_design_ethics.outcomes_avoided
  identity.values.core_values_ranked

identity.pledge
  identity.pledge.member_commitments
  identity.pledge.org_commitments
  identity.pledge.accountability_mechanisms

structure.roles          (permissions, responsibilities, criteria, member_type)
structure.membranes      (functions, roles, decision_authority, relationships)
structure.assets         (type, stewardship, access_control)

protocols.role_protocols       (add_role, remove_role, election, transition)
protocols.membrane_protocols   (decision_making, conflict_resolution, communication, meetings)
protocols.asset_protocols      (budget, resource_allocation, information_security)
```

Each tagged response includes:

- **Tag**: The most specific applicable taxonomy node
- **Content**: The extracted insight, summarized in the participant's own language (1-3 sentences)
- **Confidence**: 1.0 for explicit statements, 0.7 for clearly implied, 0.4 for inferred from context
- **Component**: The top-level component (e.g., `identity.vision`) for coverage calculation

### How the Agent Navigates the Framework

The conversation agent doesn't march through components in order. It follows a **hybrid approach**: organic conversation flow guided by internal awareness of which components remain uncovered.

The recommended arc moves through five phases:

1. **Opening** — Warm introduction, establish rapport, invite a personal story about the group
2. **Identity** — Vision → Purpose → Mission → Worldview → Values → Mandates → Pledge (but follows participant energy; if they're passionate about values, go deep there)
3. **Structure** — Roles → Membranes → Assets (scaffolding from concrete to abstract)
4. **Protocols** — Scenarios drawn from the participant's own stories in earlier phases
5. **Closing** — Reflect back key themes, ask what was missed, thank the participant

When the participant says something that naturally bridges to an uncovered component, the agent follows that thread. When conversation on a topic reaches a natural pause, the agent gently steers toward uncovered territory. It never announces transitions ("Now let's talk about Structure") — it finds organic connections.

The agent is also specifically tuned to surface **hidden insights** that wouldn't emerge in a survey:

- Competing worldview assumptions within the group
- Implicit power structures ("When a big decision needs to be made quickly, who *actually* makes it?")
- Unspoken membership boundaries
- Values-behavior gaps ("You said X is important. Can you think of a time the group didn't live up to that?")
- Protocol vacuums ("Has there been a situation where nobody knew what the process was?")
- Succession anxiety ("What happens if [key person] leaves? What breaks?")

### From Tags to Constitution

Draft generation works component by component. For each component:

1. All tagged responses for that component are gathered from all participants
2. The drafter receives these as numbered, attributed insights with confidence scores
3. It synthesizes them into constitutional language following specific rules:
   - **Consensus** (multiple participants agree) → confident authoritative statement
   - **Tension** (participants disagree) → explicitly surfaced with bridging language and an editorial note
   - **Thin data** (1-2 responses) → included but flagged as needing more input
   - **No data** → placeholder noting the gap

The result is a constitution that reads as a governance document — not as a survey summary — while remaining fully grounded in what participants actually said.

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS 4, custom design tokens (stone palette, Masonic aesthetic) |
| Database | Neon Serverless Postgres + Drizzle ORM |
| AI | Anthropic Claude API (Sonnet for conversation/tagging, Opus for drafting/synthesis) |
| Email | Resend (transactional emails for invites, draft distribution, finalization) |
| Auth | Custom JWT sessions (bcrypt + jose) |
| Deployment | Vercel |

### Four AI Agents

1. **Conversation Agent** (Claude Sonnet) — Conducts participant interviews. Follows a hybrid conversation arc: organic flow guided by an internal awareness of uncovered components.

2. **Tagger Agent** (Claude Sonnet) — Runs after each exchange. Extracts constitutional insights, tags them to the 50+ component taxonomy, assigns confidence scores, and tracks conversation state.

3. **Draft Generation Agent** (Claude Opus) — Synthesizes tagged responses into constitutional language, component by component. Handles consensus, tension, and thin data differently.

4. **Synthesis Agent** (Claude Opus) — Integrates feedback into the draft. Decides whether to revise, flag tensions, or leave sections unchanged.

### Database Schema

8 tables: `users`, `sessions`, `session_participants`, `conversations`, `messages`, `tagged_responses`, `draft_sections`, `feedback`. The core design principle: **structured data over raw text**. Every participant utterance that carries constitutional signal is extracted, tagged, and stored as a structured record. The constitution is generated from these records, not from transcript parsing.

### Project Structure

```
src/
  app/                          # Next.js App Router pages and API routes
    (auth)/                     # Login, register pages
    admin/                      # Admin dashboard, session management
    s/[slug]/                   # Participant entry, chat, feedback
    api/                        # 21 API endpoints (auth, chat, sessions, etc.)
  components/
    ui/                         # Base components (button, input, card, etc.)
    chat/                       # Chat UI (messages, input, draft sidebar)
    admin/                      # Coverage map, participant table
    shared/                     # Logo, nav, footer
  lib/
    agent/                      # AI agent orchestration
      prompts/                  # System prompts for all 4 agents
      schemas/                  # JSON schemas for structured output
    auth/                       # JWT session management
    constitution/               # Component definitions, tags, markdown assembly
    db/                         # Drizzle schema, queries
    email/                      # Resend client, email templates
    utils/                      # Slugs, tokens, SSE streaming
```

---

## Self-Hosting Guide

### Prerequisites

- Node.js 20.9+
- A [Neon](https://neon.tech) database (free tier works)
- An [Anthropic API key](https://console.anthropic.com)
- (Optional) A [Resend](https://resend.com) API key for email functionality
- (Optional) A [Vercel](https://vercel.com) account for deployment

### Local Development

```bash
# Clone the repo
git clone https://github.com/omniharmonic/constitutionbuilder.git
cd constitutionbuilder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Run database migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string. Get this from your Neon project dashboard. Use the pooled connection string. |
| `JWT_SECRET` | Yes | Secret for signing JWT session tokens. Use a random string of at least 32 characters. Generate with: `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key. Get from [console.anthropic.com](https://console.anthropic.com). Needs access to Claude Sonnet and Opus models. |
| `RESEND_API_KEY` | No | Resend API key for sending emails (invitations, draft distribution, finalization). Without this, the app works but skips email sending. |
| `EMAIL_FROM` | No | Sender address for emails, e.g. `Constitution Builder <noreply@yourdomain.com>`. Requires a verified domain in Resend. |
| `NEXT_PUBLIC_APP_URL` | Yes | The public URL of your deployment. Used for generating share links in emails. Set to `http://localhost:3000` for local dev. |

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your Vercel project
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
# Optional:
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production

# Deploy
vercel --prod
```

**Important**: The `vercel.json` file configures `maxDuration` for long-running AI routes:
- Chat endpoints: 120 seconds (streaming conversation)
- Draft generation: 300 seconds (Opus processes each component sequentially)
- Synthesis: 300 seconds (same)

This requires a Vercel Pro plan. On the free plan, functions are limited to 10 seconds, which is insufficient for AI agent calls.

### Deploy Elsewhere

Constitution Builder is a standard Next.js application. It can be deployed to any platform that supports Next.js server-side rendering:

- **Self-hosted**: `npm run build && npm start` (requires a Node.js server)
- **Docker**: Build with the standard Next.js Dockerfile
- **AWS/GCP/Azure**: Use their serverless Next.js adapters

The key requirement is that your platform supports long-running server functions (2-5 minutes) for the AI agent routes. If not, you'll need to refactor draft generation and synthesis to use a background job queue.

---

## Using the Tool

### For Admins

1. **Register** at `/register` to create an admin account
2. **Create a session** — give it a name and optional description. The description helps the AI agent understand context about your group.
3. **Share the participant link** — copy the generated `/s/[slug]` URL and send it to your group (or use the email invite feature if Resend is configured)
4. **Monitor progress** — the session detail page shows:
   - **Coverage map**: which constitution components have participant input, and how much
   - **Participant table**: who has started, completed, and how many insights they've contributed
   - **Response explorer**: browse individual tagged insights filtered by component
5. **Generate the draft** — click "Raise the Frame" when you have enough coverage. Watch real-time progress as each component is processed.
6. **Review the draft** — read the rendered markdown constitution. Download as a zip.
7. **Distribute for feedback** — transitions the session to feedback phase. Participants get a link to review the draft.
8. **Run synthesis** — integrates feedback into a revised draft. Repeat feedback/synthesis as needed.
9. **Finalize** — locks the constitution and distributes the final version.

### For Participants

1. **Click the session link** you received
2. **Enter your name** (and optionally email, to receive the draft later)
3. **Have a conversation** — the AI facilitator will guide you through topics about your group's governance. Speak naturally; share stories and examples. The conversation typically takes 15-30 minutes.
4. **Come back anytime** — your conversation is saved. Close the browser and return later to continue.
5. **Complete** when ready — click the completion link when you've shared everything important.
6. **(Later) Review the draft** — when the admin distributes the draft, you'll be able to review it and provide feedback through another guided conversation.

---

## Customization

### Modifying the Constitution Template

The constitution framework is defined in two files:

- **`src/lib/constitution/components.ts`** — Defines all 13 components (Vision, Purpose, Mission, etc.) with their titles, descriptions, key questions, and test criteria. Add, remove, or modify components here.

- **`src/lib/constitution/tags.ts`** — Defines the tag taxonomy used for classifying participant responses. Must stay in sync with the components file.

When creating a session, the admin can select which components to include — so you can use a subset of the full template without modifying code.

### Modifying Agent Behavior

The four agent system prompts are in `src/lib/agent/prompts/`:

- **`system-conversation.ts`** — Controls how the facilitator conducts interviews. This is the most impactful file to modify. Key sections: conversation rules, conversation arc, hidden insight probes, response style.

- **`system-tagger.ts`** — Controls how responses are classified. Modify if you change the tag taxonomy.

- **`system-drafter.ts`** — Controls the writing style of the constitution draft. Modify to change tone, structure, or how tensions are handled.

- **`system-synthesizer.ts`** — Controls how feedback is integrated. Modify to change how aggressively or conservatively the synthesizer revises.

### Changing the Model

Model selection is in `src/lib/agent/client.ts`:

```typescript
export const MODELS = {
  conversation: 'claude-sonnet-4-5-20250929',  // Fast, good at dialogue
  tagger: 'claude-sonnet-4-5-20250929',        // Fast, structured output
  drafter: 'claude-opus-4-6',                  // Highest quality writing
  synthesizer: 'claude-opus-4-6',              // Complex reasoning
};
```

You can switch models here. Using Sonnet for everything reduces cost significantly but may lower draft quality.

### Theming

The visual design uses CSS custom properties defined in `src/app/globals.css`:

```css
@theme inline {
  --color-stone-50: #FAF9F7;    /* Background */
  --color-blueprint: #2B4C7E;    /* Interactive elements */
  --color-brass: #B8860B;        /* Primary CTAs */
  --color-parchment: #F5F0E8;    /* Assistant message bubbles */
  /* ... */
}
```

Modify these values to change the entire color scheme. The three font families (EB Garamond for display, Libre Franklin for body, JetBrains Mono for code) are loaded in `src/app/layout.tsx`.

---

## Cost Considerations

Constitution Builder uses the Anthropic API, which is priced per token. Approximate costs per participant:

| Phase | Model | Est. Cost |
|-------|-------|-----------|
| Survey conversation (4-6 exchanges) | Sonnet | ~$0.05 |
| Tagging (per exchange) | Sonnet | ~$0.02 |
| Draft generation (13 components) | Opus | ~$0.80 |
| Feedback conversation (2-3 exchanges) | Sonnet | ~$0.03 |
| Feedback classification | Sonnet | ~$0.01 |
| Synthesis (per component with feedback) | Opus | ~$0.15 |

**Rough total for a 10-person session with one feedback round: ~$3-5.**

Draft generation and synthesis are the most expensive operations because they use Opus. Neon Postgres and Vercel hosting are effectively free at low scale.

---

## Contributing

Contributions are welcome. The codebase is organized around clear separation of concerns:

- **Agent prompts** in `src/lib/agent/prompts/` — the most impactful place to contribute. Prompt improvements directly affect conversation quality, tagging accuracy, and draft quality.
- **UI components** in `src/components/` — all built with Tailwind, no component library dependency.
- **Database queries** in `src/lib/db/queries/` — Drizzle ORM with typed queries.
- **API routes** in `src/app/api/` — standard Next.js route handlers.

### Development Workflow

```bash
npm run dev          # Start dev server
npx next build       # Verify build
npx drizzle-kit generate  # Generate migration after schema changes
npx drizzle-kit migrate   # Apply migrations
npx drizzle-kit studio    # Visual database browser
```

---

## License

Built by [OpenCivics Labs](https://opencivics.org). Based on the Solidarity Network Constitution template.
