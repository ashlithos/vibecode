#!/usr/bin/env python3
"""
Visual Agent - Answers questions with charts and graphs for visual thinkers.

Usage:
    python agent.py "How does compound interest work?"
    python agent.py                          # Interactive mode
    python agent.py --output ./my_charts "Show global temperature trends"
"""

import os
import sys
import argparse
import anthropic
from pathlib import Path

SYSTEM_PROMPT = """You are an assistant designed for visual thinkers.
For EVERY question you receive, you MUST:

1. Write a brief explanation (2-3 sentences)
2. Generate one or more charts/graphs using Python:
   - Use matplotlib and/or seaborn (both pre-installed)
   - Always call plt.savefig('descriptive_name.png', dpi=150, bbox_inches='tight')
   - Never call plt.show() — the environment has no display
   - Use plt.close() after saving to free memory
   - Choose the most appropriate chart type (bar, line, pie, scatter, heatmap, etc.)
   - Add clear titles, axis labels, and legends
   - Use a clean, readable color scheme (e.g., tab10, viridis, or seaborn defaults)
3. Briefly describe what each chart shows and the key visual takeaway

For data you need to approximate, use realistic illustrative values
and note they are representative/approximate. Always generate visuals —
that is your primary communication mode with visual thinkers."""

MAX_ITERATIONS = 10


def run_agent(question: str, output_dir: Path) -> None:
    """Ask a question and get a visual answer."""
    client = anthropic.Anthropic()
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'=' * 60}")
    print(f"Question: {question}")
    print(f"{'=' * 60}\n")

    messages = [{"role": "user", "content": question}]

    for _ in range(MAX_ITERATIONS):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=16000,
            system=SYSTEM_PROMPT,
            thinking={"type": "adaptive"},
            tools=[{"type": "code_execution_20260120", "name": "code_execution"}],
            messages=messages,
        )

        generated_files = []

        for block in response.content:
            if block.type == "text":
                print(block.text)

            elif block.type == "server_tool_use":
                print("\n[Generating visualization...]\n")

            elif block.type == "bash_code_execution_tool_result":
                result = block.content
                if result.type == "bash_code_execution_result":
                    if result.stdout:
                        stripped = result.stdout.strip()
                        if stripped:
                            print(f"[Output]: {stripped}")
                    if result.stderr and result.return_code != 0:
                        print(f"[Error]: {result.stderr[:300]}")
                    if result.content:
                        for item in result.content:
                            if item.type == "bash_code_execution_output":
                                generated_files.append(item.file_id)
                elif result.type == "bash_code_execution_tool_error":
                    print(f"[Execution error]: {result.error_code}")

        # Download any generated charts/files
        for file_id in generated_files:
            _save_file(client, file_id, output_dir)

        if response.stop_reason == "end_turn":
            break
        elif response.stop_reason == "pause_turn":
            # Server-side tool hit its iteration limit; re-send to continue.
            # Reset to [user_msg, latest_assistant] — the server resumes from
            # the trailing server_tool_use blocks automatically.
            messages = [
                messages[0],
                {"role": "assistant", "content": response.content},
            ]
        else:
            break

    _print_summary(output_dir)


def _save_file(client: anthropic.Anthropic, file_id: str, output_dir: Path) -> None:
    """Download a file from the code execution sandbox and save it locally."""
    try:
        meta = client.beta.files.retrieve_metadata(file_id)
        safe_name = Path(meta.filename).name
        if not safe_name or safe_name in (".", ".."):
            safe_name = f"chart_{file_id[:8]}.png"

        output_path = output_dir / safe_name
        client.beta.files.download(file_id).write_to_file(str(output_path))
        print(f"\n[Saved: {output_path}]")
    except Exception as e:
        print(f"\n[Warning: Could not save file {file_id}: {e}]")


def _print_summary(output_dir: Path) -> None:
    """Print a summary of saved charts."""
    charts = sorted(
        f for ext in ("*.png", "*.svg", "*.jpg", "*.pdf")
        for f in output_dir.glob(ext)
    )
    if charts:
        print(f"\n{'=' * 60}")
        print(f"Charts saved to {output_dir}/")
        for chart in charts:
            size_kb = chart.stat().st_size // 1024
            print(f"  → {chart.name}  ({size_kb} KB)")


def interactive_mode(output_dir: Path) -> None:
    """Run the agent in interactive question-answer mode."""
    print("Visual Agent for Visual Thinkers")
    print("Ask any question — answers come with charts!")
    print("Type 'quit' or press Ctrl+C to exit.\n")

    while True:
        try:
            question = input("Your question: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not question:
            continue
        if question.lower() in ("quit", "exit", "q"):
            print("Goodbye!")
            break

        run_agent(question, output_dir)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Visual Agent — answers questions with charts for visual thinkers"
    )
    parser.add_argument(
        "question",
        nargs="*",
        help="Question to ask (omit for interactive mode)",
    )
    parser.add_argument(
        "--output",
        "-o",
        default="./charts",
        metavar="DIR",
        help="Directory to save charts (default: ./charts)",
    )

    args = parser.parse_args()
    output_dir = Path(args.output)

    if args.question:
        run_agent(" ".join(args.question), output_dir)
    else:
        interactive_mode(output_dir)


if __name__ == "__main__":
    main()
