output "cf_account_id" {
  value = {
    id              = data.bitwarden-secrets_secret.cf_account_id.id
    key             = data.bitwarden-secrets_secret.cf_account_id.key
    value           = data.bitwarden-secrets_secret.cf_account_id.value
    note            = data.bitwarden-secrets_secret.cf_account_id.note
    project_id      = data.bitwarden-secrets_secret.cf_account_id.project_id
    organization_id = data.bitwarden-secrets_secret.cf_account_id.organization_id
    creation_date   = data.bitwarden-secrets_secret.cf_account_id.creation_date
    revision_date   = data.bitwarden-secrets_secret.cf_account_id.revision_date
  }
}
