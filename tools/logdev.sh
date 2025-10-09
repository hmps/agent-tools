#! /usr/bin/env bash

# logdev - Run a command with output logged to file and stdout
#
# Runs a development command while simultaneously logging all output (stdout + stderr)
# to a file. This is useful for keeping development logs that can be reviewed later
# while still seeing real-time output in the terminal.
#
# Usage:
#   logdev [--logfile=PATH] COMMAND [ARGS...]
#
# Options:
#   --logfile=PATH    Path to log file (default: .logs/dev.log)
#   --logfile PATH    Alternative syntax for specifying log file
#
# Examples:
#   logdev npm run dev
#   logdev --logfile=.logs/custom.log bun dev
#   logdev dotenvx run -- next dev --turbopack
#
# The log file will include a header with timestamp, command, and working directory.
# Output is sent to both the terminal and the log file in real-time.
# Exit codes from the wrapped command are preserved.

logdev() {
  local logfile=".logs/dev.log"
  local args=()

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --logfile=*)
        logfile="${1#*=}"
        shift
        ;;
      --logfile)
        logfile="$2"
        shift 2
        ;;
      *)
        args+=("$1")
        shift
        ;;
    esac
  done

  # Create log directory and clear log file
  mkdir -p "$(dirname "$logfile")"
  # : > "$logfile"
  cat > "$logfile" << EOF
#!/usr/bin/env bash
# Development Log
# Created: $(date '+%Y-%m-%d %H:%M:%S %Z')
# Command: ${args[*]}
# Working Directory: $(pwd)
# Log File: $logfile
# ============================================================

EOF

  # Run command with tee, preserving exit code
  bash -c "trap '' PIPE; ${args[*]} 2>&1 | tee -a \"$logfile\"; exit \${PIPESTATUS[0]}"
}

# Execute the function with all script arguments
logdev "$@"
