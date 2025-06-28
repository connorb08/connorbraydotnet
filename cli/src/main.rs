use std::io;
use clap::{CommandFactory, Parser};

// Use the library code
use cli::{Cli, Commands, DatabaseCommands, CheckCommands, DeployCommands};
use cli::commands::*;

fn print_completions(shell: clap_complete::Shell, cmd: &mut clap::Command) {
    clap_complete::generate(shell, cmd, cmd.get_name().to_string(), &mut io::stdout());
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    // Handle completion generation if requested
    if let Some(shell) = cli.generator {
        let mut cmd = Cli::command();
        print_completions(shell, &mut cmd);
        return Ok(());
    }

    // Handle commands
    match cli.command {
        Some(Commands::Database { command }) => match command {
            DatabaseCommands::Backup { output } => run_database_backup(output),
            DatabaseCommands::Restore { file, force } => run_database_restore(file, force),
            DatabaseCommands::Seed => run_database_seed(),
        },
        Some(Commands::Check { command }) => match command {
            CheckCommands::Lint { fix } => run_check_lint(fix),
            CheckCommands::Test { path } => run_check_test(path),
            CheckCommands::TypeCheck => run_check_typecheck(),
        },
        Some(Commands::Deploy { command }) => match command {
            DeployCommands::Dev => run_deploy_dev(),
            DeployCommands::Staging => run_deploy_staging(),
            DeployCommands::Prod { no_checks } => run_deploy_prod(no_checks),
        },
        None => Ok(()),
    }
}
