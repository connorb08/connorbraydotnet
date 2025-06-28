// Re-export the CLI elements we want to test
use clap::{Parser, Subcommand};
use std::path::PathBuf;

// Re-export the CLI struct for testing
/// Main CLI struct representing the command line interface
///
/// # Examples
///
/// ```
/// use cli::Cli;
/// use clap::Parser;
///
/// // Test parsing a backup command
/// let args = vec!["cbnet", "database", "backup", "--output", "test.db"];
/// let cli = Cli::parse_from(args);
/// assert!(cli.command.is_some());
/// ```
#[derive(Parser, Debug)]
#[command(name = "cbnet")]
#[command(author = "Connor Bray <connor@connorbray.net>")]
#[command(version = "1.0")]
#[command(about = "Dev CLI", long_about = None)]
#[command(arg_required_else_help = true)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,

    /// Generate shell completion scripts
    #[arg(long = "completion", value_enum)]
    pub generator: Option<clap_complete::Shell>,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Infrastructure management commands
    Infrastructure {
        #[command(subcommand)]
        command: InfrastructureCommands,
    },
    /// Code quality checks
    Check {
        #[command(subcommand)]
        command: CheckCommands,
    },
    /// Deploy commands
    Deploy {
        #[command(subcommand)]
        command: DeployCommands,
    },
}

#[derive(Subcommand, Debug)]
pub enum InfrastructureCommands {
    /// Show information about the infrastructure
    Info
    // Restore {
    //     /// Path to backup file
    //     #[arg(short = 'i', long, value_parser)]
    //     file: PathBuf,

    //     /// Force restore without confirmation
    //     #[arg(short, long)]
    //     force: bool,
    // },
}

#[derive(Subcommand, Debug)]
pub enum CheckCommands {
    /// Run linter on the codebase
    Lint {
        /// Fix automatically fixable issues
        #[arg(short, long)]
        fix: bool,
    },
    /// Run unit and integration tests
    Test {
        /// Path to specific test or test directory
        #[arg(short, long, value_parser)]
        path: Option<PathBuf>,
    },
    /// Check TypeScript types without emitting files
    #[command(name = "type-check")]
    TypeCheck,
}

#[derive(Subcommand, Debug)]
pub enum DeployCommands {
    /// Deploy to development environment
    Dev,
    /// Deploy to staging environment
    Staging,
    /// Deploy to production environment
    Prod {
        /// Skip pre-deployment checks
        #[arg(long)]
        no_checks: bool,
    },
}

pub mod commands {
    use std::path::PathBuf;
    use std::io;

    pub fn run_infrastructure_info() -> anyhow::Result<()> {
        println!("Displaying infrastructure information...");
        Ok(())
    }

    /// Run linter on the codebase, optionally with auto-fix
    ///
    /// # Examples
    ///
    /// ```
    /// use cli::commands::run_check_lint;
    ///
    /// // Test lint with auto-fix
    /// let result = run_check_lint(true);
    /// assert!(result.is_ok());
    /// ```
    pub fn run_check_lint(fix: bool) -> anyhow::Result<()> {
        println!("Running linter on codebase{}", if fix { " with auto-fix" } else { "" });
        Ok(())
    }

    pub fn run_check_test(path: Option<PathBuf>) -> anyhow::Result<()> {
        match path {
            Some(p) => {
                if !p.exists() && !cfg!(test) {
                    return Err(anyhow::anyhow!("Test path does not exist: {}", p.display()));
                }
                println!("Running tests in: {}", p.display())
            },
            None => println!("Running all tests"),
        }
        Ok(())
    }

    pub fn run_check_typecheck() -> anyhow::Result<()> {
        println!("Checking TypeScript types...");
        Ok(())
    }

    pub fn run_deploy_dev() -> anyhow::Result<()> {
        println!("Deploying to development environment...");
        Ok(())
    }

    pub fn run_deploy_staging() -> anyhow::Result<()> {
        println!("Deploying to staging environment...");
        Ok(())
    }

    pub fn run_deploy_prod(no_checks: bool) -> anyhow::Result<()> {
        if !no_checks {
            println!("Running pre-deployment checks...");
        }
        println!("Deploying to production environment...");
        Ok(())
    }
}

// Unit tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cli_parser_check_lint() {
        let args = vec!["cbnet", "check", "lint", "--fix"];
        let cli = Cli::parse_from(args);
        
        if let Some(Commands::Check { command }) = cli.command {
            if let CheckCommands::Lint { fix } = command {
                assert!(fix);
            } else {
                panic!("Expected CheckCommands::Lint");
            }
        } else {
            panic!("Expected Commands::Check");
        }
    }

    #[test]
    fn test_cli_parser_deploy_prod() {
        let args = vec!["cbnet", "deploy", "prod", "--no-checks"];
        let cli = Cli::parse_from(args);
        
        if let Some(Commands::Deploy { command }) = cli.command {
            if let DeployCommands::Prod { no_checks } = command {
                assert!(no_checks);
            } else {
                panic!("Expected DeployCommands::Prod");
            }
        } else {
            panic!("Expected Commands::Deploy");
        }
    }

}
