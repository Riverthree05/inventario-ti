## Cómo habilitar protección de rama en GitHub

Se recomienda habilitar las siguientes reglas en la rama `main` antes de permitir merges a producción:

1. Require pull request reviews before merging (1-2 reviewers).
2. Require status checks to pass before merging — configurar CI (GitHub Actions) para correr tests y builds.
3. Dismiss stale pull request approvals when new commits are pushed.
4. Require branches to be up to date before merging.
5. Restrict who can push to the `main` branch (e.g., only admins).

Pasos (GitHub UI):
- Repo -> Settings -> Branches -> Add rule
- Branch name pattern: `main`
- Check the boxes for the rules arriba y guardar.

Si no tienes permisos de admin, pide a quien los tenga que aplique estas reglas.
