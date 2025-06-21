## Getting started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **Poetry** for Python dependencies (we provide a `pyproject.toml`).

### Install dependencies

```bash
# Frontend
# Install Node workspace deps (root + frontend)
pnpm install

# Backend
cd ../backend
poetry install --with dev
```

### Development workflow

```bash
# Start backend (http://localhost:8000
docker compose up

# Or if running without Docker:
# Backend
cd backend
poetry run uvicorn app.main:app --reload

# Frontend (in a new terminal)
cd frontend
pnpm start
```

### Shared schema & code generation

API schemas are defined once in `shared/schemas.ts` using [Zod](https://github.com/colinhacks/zod).
Both TypeScript types and Python models are generated from this single source:

```bash
# Generate JSON schema and Pydantic models
cd backend
poetry run python scripts/generate_models.py

# Or just generate JSON schema
pnpm run generate:schema
```

To add new endpoints, simply add schemas to `shared/schemas.ts`:

```typescript
export const schemas = {
  // ... existing schemas ...

  YourRequest: z.object({
    /* fields */
  }),
  YourResponse: z.object({
    /* fields */
  }),
};
```

Generated files:

- `shared/codegen/api-schemas.json` - Combined JSON schema
- `backend/app/models.py` - All Pydantic models

### Quality checks

```bash
# Frontend
pnpm run lint          # ESLint
pnpm run typecheck     # tsc --noEmit
pnpm run format        # Prettier –-write

# Backend
poetry run ruff check .          # Lint
poetry run pyright               # Static type-checking
```
