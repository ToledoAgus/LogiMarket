# Supabase local

Supabase CLI is pinned as a development dependency. Docker Desktop must be running
before using the local stack.

## Windows prerequisite and installation

Current workstation audit (2026-06-20): Windows with WSL 2.6.2 configured, but Docker
Desktop, the `docker` command, its Windows service and daemon are absent. `winget` is
also unavailable, so use the official installer:

1. Download **Docker Desktop for Windows - x86_64** from
   <https://docs.docker.com/desktop/setup/install/windows-install/>.
2. Run `Docker Desktop Installer.exe` and keep **Use WSL 2 instead of Hyper-V** enabled.
3. Restart Windows if the installer requests it.
4. Open **Docker Desktop** from the Start menu, accept its terms, and wait until the UI
   reports that the engine is running. Opening the executable directly is equivalent:

   ```powershell
   Start-Process -FilePath 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
   ```

5. In a new PowerShell window, verify that both client and server respond:

   ```powershell
   docker version
   docker info
   ```

Do not continue when `docker version` lacks a **Server** section or reports that it
cannot connect to `//./pipe/docker_engine`.

## Pending gate commands

Run these commands from the repository root, in this order, after Docker responds:

```bash
npm run db:start
npm run db:reset
npm run db:lint
npm run db:types
npm run lint
npm run typecheck
npm run test
npm run build
```

`db:reset` applies every migration and then the idempotent `seed.sql`. Generated
TypeScript types are written to `src/types/database.generated.ts`; do not edit that
file manually.

## Security model

Every application table has Row Level Security enabled. No policy means deny. The
service role bypasses RLS and must never be exposed through a `NEXT_PUBLIC_*` variable.
Roles are tenant memberships in `organization_members`, not user-editable Auth
metadata.

| Resource | Visitor (`anon`) | Customer | Subadmin | Admin |
|---|---|---|---|---|
| Active brands/categories/products/images/promotions | Read | Read | Read | Full CRUD |
| `public_catalog_products` | Read, including safe stock projection | Read | Read | Read |
| Price lists and current product prices | Denied | Read in active tenant | Read in active tenant | Full CRUD |
| Customers | Denied | Own record | CRUD in tenant | CRUD in tenant |
| Orders and items | Denied | Own orders, read only | CRUD in tenant | CRUD in tenant |
| Inventory | Denied | Denied | CRUD in tenant | CRUD in tenant |
| Audit/history tables | Denied | Own order status history | Read permitted history | Read permitted history |
| Memberships | Denied | Own membership | Own membership | CRUD in tenant |

The public catalog view explicitly excludes `product_prices`, price amounts and
reserved stock. Base price tables have no `anon` policy. Authenticated price reads also
require an active membership in the row's organization.

Subadmins can update inventory balances; an audit trigger records every quantity
change. Price and order status histories are inserted by protected trigger functions
and cannot be directly updated or deleted by authenticated clients.

## Storage

- `product-images`: public reads; admin writes only under `<organization-id>/...`.
- `organization-assets`: private; admin access only under `<organization-id>/...`.

File size is capped at 5 MiB per bucket and image MIME types are allow-listed.

## Seed identities

The seed creates business data only. It deliberately does not create Auth users or
embed credentials. Create development users through Supabase Auth and then add their
membership with a local SQL session when testing roles.
