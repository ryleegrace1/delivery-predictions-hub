// H1 Intended Outcomes → Vault Project mapping.
// Edit this file to add/remove outcomes as the plan evolves.
//
// Each entry is either:
//   { outcome, priority, bet, owner, vaultId }   ← Vault-tracked
//   { outcome, priority, bet, owner, offVault: true }  ← intended but no GSD project

window.H1_PLAN = {
  bets: [
    {
      id: "bet1",
      title: "Bet 1: Land DHM Model & Validate Product Unlocks",
      blurb: "Ship DHM to production and run the experiments that lock in display logic.",
      outcomes: [
        { outcome: "Prediction bundles (CDF) available across surfaces", priority: "P0", owner: "Experience Platform", vaultId: 50527 },
        { outcome: "Baseline & cutoff experiment (5/8/14d windows)", priority: "P0", owner: "Experience", vaultId: 50473 },
        { outcome: "Buyer-friendly EDD language experiment", priority: "P0", owner: "Experience", vaultId: 50853 },
        { outcome: "Optimal window by merchant type / category", priority: "P1", owner: "Experience", offVault: true },
        { outcome: "Test specific date vs. date range display", priority: "P0", owner: "Experience", offVault: true },
        { outcome: "Range sensitivities (P25-P75 vs. P50-P75)", priority: "P1", owner: "Experience", offVault: true }
      ]
    },
    {
      id: "bet2",
      title: "Bet 2: Predictions as Platform Primitive",
      blurb: "Extend predictions beyond checkout into search, discovery, and agentic surfaces.",
      outcomes: [
        { outcome: "Bulk prediction pipelines at scale", priority: "P0", owner: "Data Platform", vaultId: 50343 },
        { outcome: "Coarse-grained predictions in Google Shopping", priority: "P0", owner: "Experience Platform", vaultId: 50284 },
        { outcome: "Predictions in Catalog API (OpenAI / agentic PDP)", priority: "P0", owner: "Experience Platform", vaultId: 50173 },
        { outcome: "Catalog API live predictions", priority: "P2", owner: "Experience Platform", vaultId: 50791 },
        { outcome: "Live predictions for Checkout MCP", priority: "P0", owner: "Experience Platform", offVault: true },
        { outcome: "Inflight post-checkout predictions", priority: "P0", owner: "Experience", vaultId: 49458 },
        { outcome: "Delivery predictions in Shop app cart", priority: "P1", owner: "Experience", vaultId: 49171 },
        { outcome: "Delivery predictions in merchant admin", priority: "P1", owner: "Experience", vaultId: 49756 },
        { outcome: "Buyer-facing predictions in CA / AUS / NZ", priority: "P1", owner: "Data Experience Platform", offVault: true },
        { outcome: "Label recommendation engine update", priority: "P2", owner: "Experience", offVault: true }
      ]
    },
    {
      id: "bet3",
      title: "Bet 3: (Re)Define Promise Strategy & Eligibility",
      blurb: "Evolve Promise from exclusivity play into broader buyer trust standard.",
      outcomes: [
        { outcome: "Shop Promise long-term vision and strategy", priority: "P0", owner: "Product", offVault: true },
        { outcome: "Merchant value prop: eligibility & benefits", priority: "P0", owner: "Product", offVault: true },
        { outcome: "Transition communication to merchants", priority: "P0", owner: "Product Design", offVault: true },
        { outcome: "Begin implementation of new Promise program", priority: "P1", owner: "Data Experience", offVault: true }
      ]
    },
    {
      id: "hardening",
      title: "DHM Model Hardening & Iteration",
      blurb: "Production stability, feature simplification, observability.",
      outcomes: [
        { outcome: "Feature simplification + MySQL → Query Engine", priority: "P0", owner: "Data Platform", vaultId: 50391 },
        { outcome: "Drift detection / observability dashboard", priority: "P1", owner: "Data Platform", vaultId: 51131 },
        { outcome: "Dynamic model loading (no-deploy updates)", priority: "P0", owner: "Platform", vaultId: 46690 },
        { outcome: "DHM library production hardening", priority: "P1", owner: "Data Platform", vaultId: 49207 },
        { outcome: "Continuous training & accuracy iteration", priority: "P0", owner: "Data Platform", offVault: true },
        { outcome: "Document model inputs and failure modes", priority: "P1", owner: "Data", offVault: true },
        { outcome: "CI validations and E2E testing", priority: "P1", owner: "Data Platform", offVault: true }
      ]
    },
    {
      id: "enablement",
      title: "Merchant Enablement",
      blurb: "Help merchants understand shipping performance gaps and close them.",
      outcomes: [
        { outcome: "Expand shipping insights / analytics in admin", priority: "P2", owner: "Experience", vaultId: 47559 }
      ]
    }
  ],

  // Projects the team paused/stopped during H1 — context for SLT.
  paused: [
    { vaultId: 49458, label: "Continuous lifecycle predictions", reason: "Paused", bet: "Bet 2" },
    { vaultId: 50718, label: "Auto-enable predictions on Shop Pay web", reason: "Paused", bet: "Bet 1" },
    { vaultId: 50074, label: "Decouple raw predictions from policy", reason: "Stopped — replaced by #50527", bet: "Bet 1" },
    { vaultId: 49209, label: "Move DHM to Monorepo", reason: "Stopped", bet: "Hardening" },
    { vaultId: 48530, label: "ML model for interpreted predictions", reason: "Stopped", bet: "Bet 2" },
    { vaultId: 47734, label: "Baseline testing & language optimization", reason: "Stopped — replaced by #50473", bet: "Bet 1" },
    { vaultId: 49216, label: "Live predictions via product loader (old)", reason: "Stopped", bet: "Bet 2" }
  ]
};
