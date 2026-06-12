# dp-h1-performance-to-plan

Live H1 Performance to Plan dashboard for Delivery Predictions. Fetches each H1 intended outcome's underlying Vault project on page load and renders the Payments-style phase breakdown.

**Live URL (once deployed):** `https://dp-h1-performance-to-plan.quick.shopify.io`

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Vault phase color palette + layout |
| `plan.js` | **The plan.** H1 intended outcomes → Vault project mapping. Edit this when the plan changes. |
| `app.js` | Fetches Vault project JSON, computes phase breakdown, renders. |

The only file that needs editing as the plan evolves is `plan.js`. Add an `outcome` to any bet's `outcomes` array. If it has a GSD project, use `vaultId: 12345`. If it doesn't, use `offVault: true` and it'll surface in the Off Vault section.

## Deploy

```bash
# From this directory:
git init
git add .
git commit -m "Initial commit"
gh repo create ryleegrace1/dp-h1-performance-to-plan --public --source=. --push

# Then deploy as a Shopify quick site:
quick deploy
```

The `quick deploy` command (assuming you have it installed and authed) will publish this directory to `https://dp-h1-performance-to-plan.quick.shopify.io`.

If you don't have the `quick` CLI yet:

```bash
gem install quick-shopify  # or your team's standard install path
quick auth login
```

## How it pulls live data

`app.js` fetches `https://vault.shopify.io/projects/{id}.json` for each project in `plan.js`. This relies on Vault's Rails JSON convention and SSO. Anyone viewing the dashboard must be signed into Vault — if they're not, we surface a banner asking them to sign in.

If the endpoint shape isn't quite right, adjust `normalizeProject()` in `app.js` — it's defensive about which keys map to phase/status/title.

## Refresh cadence

The page refreshes on load. There's no caching. If a project's phase changes in Vault, refresh and it shows up here.

## Updating the plan

```bash
# Edit plan.js — add/remove outcomes, update Vault IDs
git commit -am "Update H1 plan"
git push
# Quick sites redeploy automatically on push (or run `quick deploy` again)
```
