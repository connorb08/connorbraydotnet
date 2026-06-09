output "database_id" {
  description = "The ID of the database"
  value       = cloudflare_d1_database.database.id
  sensitive   = true
}
