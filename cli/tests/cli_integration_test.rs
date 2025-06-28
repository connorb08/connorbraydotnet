use assert_cmd::prelude::*;
use predicates::prelude::*;
use std::process::Command;
use tempfile::tempdir;
use std::fs;

#[test]
fn test_help_output() -> Result<(), Box<dyn std::error::Error>> {
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.arg("--help");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Connor Bray's website management CLI"));

    Ok(())
}

#[test]
fn test_database_commands() -> Result<(), Box<dyn std::error::Error>> {
    let temp_dir = tempdir()?;
    let backup_path = temp_dir.path().join("test_backup.db");
    let backup_path_str = backup_path.to_str().unwrap();
    
    // Test database backup command
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["database", "backup", "--output", backup_path_str]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains(backup_path_str));
        
    // Verify the file was created
    assert!(fs::metadata(&backup_path).is_ok(), "Backup file should be created");

    // Create a file that we can use for restore
    fs::write(&backup_path, b"test backup data")?;

    // Test restore with force flag
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["database", "restore", "--file", backup_path_str, "--force"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Restoring database from:"));

    // Test database seed command
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["database", "seed"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Seeding database with sample data"));

    Ok(())
}

#[test]
fn test_check_commands() -> Result<(), Box<dyn std::error::Error>> {
    // Test lint command
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["check", "lint"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Running linter on codebase"));

    // Test lint with fix command
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["check", "lint", "--fix"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Running linter on codebase with auto-fix"));

    // Test typecheck command
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["check", "type-check"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Checking TypeScript types"));

    Ok(())
}

#[test]
fn test_deploy_commands() -> Result<(), Box<dyn std::error::Error>> {
    // Test dev deployment
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["deploy", "dev"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Deploying to development environment"));

    // Test staging deployment
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["deploy", "staging"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Deploying to staging environment"));

    // Test prod deployment with checks
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["deploy", "prod"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Running pre-deployment checks"))
        .stdout(predicate::str::contains("Deploying to production environment"));

    // Test prod deployment without checks
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["deploy", "prod", "--no-checks"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("Deploying to production environment"));
    
    // Make sure the pre-deployment checks message is not included
    let output = Command::cargo_bin("cli")?
        .args(["deploy", "prod", "--no-checks"])
        .output()?;
    let output_str = String::from_utf8(output.stdout)?;
    assert!(!output_str.contains("Running pre-deployment checks"));

    Ok(())
}

#[test]
fn test_shell_completion() -> Result<(), Box<dyn std::error::Error>> {
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.args(["--completion", "bash"]);
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("_cbnet()"));

    Ok(())
}

#[test]
fn test_invalid_command() -> Result<(), Box<dyn std::error::Error>> {
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.arg("invalid-command");
    cmd.assert()
        .failure();

    Ok(())
}

#[test]
fn test_no_args_shows_help() -> Result<(), Box<dyn std::error::Error>> {
    let mut cmd = Command::cargo_bin("cli")?;
    cmd.assert()
        .failure()  // clap returns error code when showing help due to arg_required_else_help
        .stderr(predicate::str::contains("Connor Bray's website management CLI"))
        .stderr(predicate::str::contains("Usage:"));

    Ok(())
}
