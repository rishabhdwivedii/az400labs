# AZ-400 GitHub Actions, Docker, and Azure Lab

[![CI and container deployment](https://github.com/OWNER/REPOSITORY/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/OWNER/REPOSITORY/actions/workflows/ci-cd.yml)

This single lab combines GitHub Actions fundamentals, continuous integration,
artifacts, encrypted secrets, release tags, multi-stage Docker builds, Azure
Container Registry (ACR), and Azure App Service deployment.

## What you will practice

1. Run a Node.js service and automated tests.
2. Trigger workflows on pull requests, pushes, tags, and manual dispatches.
3. Inspect jobs, runners, logs, and uploaded test artifacts.
4. Build a tested multi-stage Docker image.
5. Store credentials as GitHub encrypted secrets.
6. Push the image to ACR and deploy it to Azure App Service.

## Prerequisites

- Node.js 20 or later
- Docker Desktop
- Git and a GitHub account
- Azure CLI and an Azure subscription for the deployment section

## Part 1: Run and test locally

The local `.env` file is already present and ignored by Git. Change its sample
values as needed, but never put credentials into a commit.

```powershell
npm run dev
```

Open `http://localhost:3000` and `http://localhost:3000/health`, then run:

```powershell
npm test
npm run check
```

## Part 2: Build the container

The first Docker stage runs checks and tests. Only the application and Node.js
runtime are copied into the final stage.

```powershell
docker build -t az400-actions-lab:local .
docker run --rm -p 3000:3000 --env APP_ENV=container az400-actions-lab:local
```

Inspect the stages with `docker history az400-actions-lab:local` and verify the
health endpoint again.

## Part 3: Publish to GitHub

Create an empty GitHub repository, replace `OWNER/REPOSITORY` in the badge near
the top of this file, and publish the lab:

```powershell
git init
git add .
git commit -m "Add combined AZ-400 CI/CD lab"
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

On the repository **Actions** tab, open the workflow run. Inspect each job and
download the `test-results-*` artifact. Create a branch and pull request to see
that deployment is skipped for pull requests.

## Part 4: Configure Azure deployment

Create an ACR and a Linux App Service configured for a custom container. The
App Service must be able to pull images from the registry. A managed identity
with the `AcrPull` role is preferred; registry credentials are simpler for a
temporary learning environment.

In GitHub, open **Settings > Secrets and variables > Actions** and add:

| Type     | Name                | Value                                          |
| -------- | ------------------- | ---------------------------------------------- |
| Variable | `ACR_LOGIN_SERVER`  | Registry host, such as `myregistry.azurecr.io` |
| Variable | `AZURE_WEBAPP_NAME` | Existing Azure App Service name                |
| Secret   | `ACR_USERNAME`      | ACR credential used by GitHub Actions          |
| Secret   | `ACR_PASSWORD`      | ACR credential used by GitHub Actions          |
| Secret   | `AZURE_CREDENTIALS` | Azure service principal JSON                   |

For a lab service principal, use Azure CLI and scope it as narrowly as possible:

```powershell
az ad sp create-for-rbac --name az400-actions-lab --role Contributor --scopes /subscriptions/<subscription-id>/resourceGroups/<resource-group> --sdk-auth
```

Store the complete JSON output as `AZURE_CREDENTIALS`. Do not place it in
`.env`. Push another commit or manually dispatch the workflow. The `deploy` job
stays skipped until both repository variables are present.

## Part 5: Mark a release

```powershell
git tag -a v1.0.0 -m "First lab release"
git push origin v1.0.0
```

The tag triggers CI and the container build. Deployment remains restricted to
the `main` branch. This separation demonstrates how events and job conditions
control a workflow.

## Clean up

Delete the Azure resource group after the lab to stop charges:

```powershell
az group delete --name <resource-group> --yes --no-wait
```
