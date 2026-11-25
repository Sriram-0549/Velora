# Velora on Kubernetes (Minikube)

This folder deploys the Velora e-commerce app to a local Minikube cluster.

```
Browser --> frontend (nginx, port 3000) --> backend (Node/Express, port 5000) --> postgres (port 5432)
```

Everything is internal to the cluster (`ClusterIP` / headless Services). Nothing is exposed publicly.

## Files

| File | What it creates |
|------|-----------------|
| `postgres.yaml` | Secret (DB credentials), headless Service `postgres`, StatefulSet with a 1Gi persistent volume |
| `backend.yaml` | Deployment (1 replica) and Service `backend` on port 5000 |
| `frontend.yaml` | Deployment (1 replica) and Service `frontend` on port 3000 |

## Images

Built and pushed to GitHub Container Registry by GitHub Actions (`.github/workflows/ci-cd.yml`) on every push to `main`:

- `ghcr.io/sriram-0549/velora/velora-backend:main`
- `ghcr.io/sriram-0549/velora/velora-frontend:main`
- PostgreSQL uses the official `postgres:16` image.

## Prerequisites

- Docker, `kubectl` and Minikube installed
- A green GitHub Actions run, so the `:main` images are up to date
- GHCR packages set to **public**, or an image pull secret configured (private packages cause `ImagePullBackOff`)

## Deploy

Run from the repository root, in this order. The order matters.

```bash
# 1. Start the cluster
minikube start

# 2. Database
kubectl apply -f kubernetes/postgres.yaml
kubectl rollout status statefulset/postgres

# 3. Backend
kubectl apply -f kubernetes/backend.yaml
kubectl rollout status deployment/backend

# 4. Frontend (needs the `backend` Service to exist, because nginx resolves it at startup)
kubectl apply -f kubernetes/frontend.yaml
kubectl rollout status deployment/frontend
```

Check everything:

```bash
kubectl get pods
kubectl get svc
```

All Pods should show `Running` and `1/1`.

## Open the app

```bash
kubectl port-forward svc/frontend 3000:3000
```

Keep that terminal open and visit **http://localhost:3000**.

If port 3000 is busy, use another local port, for example `8080:3000`, and open `http://localhost:8080`.

## Verify the database is really used

Open **http://localhost:3000/api/health** and check:

```json
"database_mode": "postgresql"
```

If it says `embedded_local`, the backend could not reach Postgres and fell back to its local JSON file. Restart the backend once Postgres is Ready:

```bash
kubectl rollout restart deployment/backend
```

## How the pieces connect

- **Backend to database:** `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/velora_db`. The host `postgres` is the Postgres Service name.
- **Frontend to backend:** the React app calls `/api/...`. Nginx forwards `/api/` to `http://backend:5000`, and `backend` is the backend Service name.
- **Tables and seed data:** the backend creates the schema and seeds the 50 products on first start. No init scripts are needed.
- **Persistence:** Postgres data lives on a PersistentVolumeClaim (`postgres-data-postgres-0`), so it survives Pod restarts and deletions.

## Update after pushing new code

After GitHub Actions finishes, pull the new `:main` images:

```bash
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ImagePullBackOff` | Make the GHCR package public, or add an image pull secret |
| Frontend `CrashLoopBackOff`, log says `host not found in upstream "backend"` | Apply `backend.yaml` first, then `kubectl rollout restart deployment/frontend` |
| Frontend log shows Vite or `npm run dev` | The `:main` image is stale. Check the GitHub Actions run, fix it, then restart the Deployment |
| `database_mode` is `embedded_local` | Wait for Postgres to be Ready, then restart the backend |
| Pod stuck in `Pending` | Run `kubectl describe pod <name>` and read the Events at the bottom |

Useful commands:

```bash
kubectl logs deploy/backend
kubectl logs deploy/frontend
kubectl logs statefulset/postgres
kubectl describe pod -l app=backend
```

## Clean up

Remove the app (database data is kept):

```bash
kubectl delete -f kubernetes/frontend.yaml
kubectl delete -f kubernetes/backend.yaml
kubectl delete -f kubernetes/postgres.yaml
```

Also delete the database data:

```bash
kubectl delete pvc postgres-data-postgres-0
```

Stop or remove the cluster:

```bash
minikube stop
minikube delete
```

## Notes

- The database credentials (`postgres` / `postgres`) are for local development only. Use a real password and a proper Secret for anything beyond Minikube.
- All resources run in the `default` namespace.
