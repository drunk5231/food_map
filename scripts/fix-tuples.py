#!/usr/bin/env python3
"""
Fix data issues in seed-dishes.sql:
1. Tuples with only 24 values (missing pairing_staple) get '' added.
2. '),,'  (double comma after closing paren) fixed to '),'
Then re-split the fixed file into part files of 50 tuples each.
"""

import re
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MAIN_FILE = os.path.join(SCRIPT_DIR, "seed-dishes.sql")


def count_tuple_values(tuple_str):
    """Count the number of top-level values in a tuple string.
    Handles: escaped quotes '', ARRAY[...], strings '...'.
    The tuple_str should be the content between ( and ).
    """
    i = 0
    n = len(tuple_str)
    count = 0
    in_string = False
    bracket_depth = 0

    while i < n:
        c = tuple_str[i]

        if in_string:
            if c == "'" and i + 1 < n and tuple_str[i + 1] == "'":
                # escaped quote ''
                i += 2
                continue
            elif c == "'":
                in_string = False
                i += 1
                continue
            else:
                i += 1
                continue
        else:
            # Not in string
            if bracket_depth > 0:
                # Inside ARRAY[...]
                if c == '[':
                    bracket_depth += 1
                elif c == ']':
                    bracket_depth -= 1
                i += 1
                continue

            if c == "'":
                in_string = True
                i += 1
                continue
            elif c == '[':
                bracket_depth += 1
                i += 1
                continue
            elif c == ',':
                count += 1
                i += 1
                continue
            else:
                i += 1
                continue

    # Number of values = number of commas + 1 (for the last value after the last comma)
    # But we need to handle the case where the tuple might be empty or have trailing whitespace
    # Actually: values = commas + 1 only if there's content.
    # Let's count non-whitespace content to see if there's at least one value.
    stripped = tuple_str.strip()
    if not stripped:
        return 0
    return count + 1


def extract_tuple_content(line, start_pos):
    """Given a line and position of '(', find the matching ')' and return
    (tuple_content, end_pos_in_line, end_line_idx).
    This handles multi-line tuples.
    Returns (content_between_parens, line_idx_after_tuple, char_pos_after_tuple, raw_tuple_text)
    """
    # This is complex for multi-line; we'll use a different approach
    pass


def find_and_fix_tuples(lines):
    """Process lines to find tuples, count values, and fix issues.
    Returns (fixed_lines, fix_report).
    """
    fixes = []
    fixed_lines = list(lines)

    # Strategy: find tuple boundaries using ( at start of meaningful content
    # and ) at end (possibly followed by , or whitespace)
    # Tuples span multiple lines.

    # First pass: find all tuple start/end line indices
    tuples = []  # list of (start_line_idx, end_line_idx)
    i = 0
    n = len(fixed_lines)

    while i < n:
        line = fixed_lines[i].strip()
        # Tuple starts with ( at beginning of a value line
        if line.startswith("(") and "'" in line:
            start = i
            # Find the end: a line that ends with ) or ),  (possibly with whitespace)
            j = i
            paren_depth = 0
            found_end = False
            while j < n:
                l = fixed_lines[j]
                for ci, ch in enumerate(l):
                    if ch == '(' and not _in_string(l, ci):
                        paren_depth += 1
                    elif ch == ')' and not _in_string(l, ci):
                        paren_depth -= 1
                        if paren_depth == 0:
                            # Found the closing paren
                            tuples.append((start, j))
                            i = j + 1
                            found_end = True
                            break
                if found_end:
                    break
                j += 1
            if not found_end:
                i += 1
        else:
            i += 1

    # Now process each tuple
    # Process in reverse order so line insertions don't shift indices
    for t_start, t_end in reversed(tuples):
        # Reconstruct the tuple text
        tuple_lines = fixed_lines[t_start:t_end + 1]
        tuple_text = "\n".join(tuple_lines)

        # Extract content between ( and )
        # Find first ( and last )
        paren_start = tuple_text.index('(')
        paren_end = tuple_text.rindex(')')
        content = tuple_text[paren_start + 1:paren_end]

        value_count = count_tuple_values(content)

        if value_count == 24:
            # Need to add '' for pairing_staple
            # Insert '' before the closing ) on the last line
            last_line = fixed_lines[t_end]
            # Find the ) in the last line
            rparen_pos = last_line.rindex(')')
            # Check if there's a comma after )
            after_rparen = last_line[rparen_pos + 1:]
            # Insert '', '' before )
            # Current last value line looks like: "  '', '', ''),"
            # We need: "  '', '', '', ''),"
            # Find the last '' before )
            before = last_line[:rparen_pos]
            # The content before ) should end with something like "  '', '', ''"
            # Add ", ''" before the )
            fixed_line = before + ", ''" + last_line[rparen_pos:]
            fixed_lines[t_end] = fixed_line
            fixes.append(f"Tuple at line {t_start + 1}: had {value_count} values, added '' for pairing_staple")
        elif value_count == 25:
            pass  # OK
        else:
            fixes.append(f"WARNING: Tuple at line {t_start + 1} has {value_count} values (expected 24 or 25)")

    return fixes, fixed_lines


def _in_string(line, pos):
    """Check if position pos in line is inside a SQL string literal."""
    in_str = False
    i = 0
    while i < pos:
        c = line[i]
        if in_str:
            if c == "'" and i + 1 < len(line) and line[i + 1] == "'":
                i += 2
                continue
            elif c == "'":
                in_str = False
        else:
            if c == "'":
                in_str = True
        i += 1
    return in_str


def fix_double_comma(content):
    """Find and fix '),,' patterns to '),'. Returns (fixed_content, count)."""
    count = content.count('),,')
    if count > 0:
        content = content.replace('),,', '),')
    return content, count


def split_into_parts(content, tuples_per_part=50):
    """Split the fixed SQL into part files."""
    lines = content.split('\n')

    # Find the header: everything before the first tuple
    # Find INSERT INTO ... VALUES line
    insert_line_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("INSERT INTO"):
            insert_line_idx = i
            break

    if insert_line_idx is None:
        print("ERROR: Could not find INSERT INTO line")
        return

    header_lines = lines[:insert_line_idx + 1]  # includes INSERT INTO line

    # Find the footer: ON CONFLICT (id) DO NOTHING;
    footer_start = None
    for i in range(len(lines) - 1, -1, -1):
        if "ON CONFLICT" in lines[i]:
            footer_start = i
            break

    if footer_start is None:
        print("ERROR: Could not find ON CONFLICT line")
        return

    # Collect comment lines between INSERT and first tuple
    # These are region headers etc.
    # We need to preserve them in the output

    # Find all tuple boundaries
    tuples = []  # list of (start_line_idx, end_line_idx, pre_comment_lines)
    i = insert_line_idx + 1
    n = len(lines)

    # Collect any comment/blank lines before first tuple
    pre_tuple_comments = []
    while i < n:
        stripped = lines[i].strip()
        if stripped.startswith("("):
            break
        elif stripped.startswith("--") or stripped == "":
            pre_tuple_comments.append(lines[i])
            i += 1
        else:
            i += 1

    current_comments = list(pre_tuple_comments)

    while i < n:
        stripped = lines[i].strip()
        if stripped.startswith("(") and ("'" in stripped or stripped == "("):
            start = i
            # Find closing paren
            j = i
            paren_depth = 0
            found_end = False
            while j < n:
                l = lines[j]
                for ci, ch in enumerate(l):
                    if ch == '(' and not _in_string(l, ci):
                        paren_depth += 1
                    elif ch == ')' and not _in_string(l, ci):
                        paren_depth -= 1
                        if paren_depth == 0:
                            tuples.append((start, j, current_comments))
                            current_comments = []
                            i = j + 1
                            found_end = True
                            break
                if found_end:
                    break
                j += 1
            if not found_end:
                i += 1
        elif stripped.startswith("--") or stripped == "":
            current_comments.append(lines[i])
            i += 1
        else:
            i += 1

    total_tuples = len(tuples)
    print(f"Total tuples found: {total_tuples}")

    # Split into parts
    part_num = 1
    for chunk_start in range(0, total_tuples, tuples_per_part):
        chunk_end = min(chunk_start + tuples_per_part, total_tuples)
        chunk = tuples[chunk_start:chunk_end]

        part_lines = list(header_lines)  # copy header
        part_lines.append("")  # blank line after INSERT

        # Include pre-comments from first tuple in chunk
        if chunk[0][2]:
            for cl in chunk[0][2]:
                part_lines.append(cl)

        for idx, (t_start, t_end, comments) in enumerate(chunk):
            if idx > 0 and comments:
                for cl in comments:
                    part_lines.append(cl)

            for li in range(t_start, t_end + 1):
                part_lines.append(lines[li])

            # Add comma between tuples, or newline after last
            if idx < len(chunk) - 1:
                # Ensure the tuple line ends with ,
                last = part_lines[-1].rstrip()
                if not last.endswith(','):
                    part_lines[-1] = last + ','
                part_lines.append("")  # blank line between tuples
            else:
                # Last tuple - no trailing comma
                last = part_lines[-1].rstrip()
                if last.endswith(','):
                    part_lines[-1] = last[:-1]
                part_lines.append("")

        part_lines.append("ON CONFLICT (id) DO NOTHING;")
        part_lines.append("")

        part_filename = os.path.join(SCRIPT_DIR, f"seed-dishes-part-{part_num:02d}.sql")
        with open(part_filename, 'w', encoding='utf-8') as f:
            f.write('\n'.join(part_lines))
        print(f"  Written: seed-dishes-part-{part_num:02d}.sql ({chunk_end - chunk_start} tuples)")
        part_num += 1

    # Remove old part files beyond this count
    while True:
        old_file = os.path.join(SCRIPT_DIR, f"seed-dishes-part-{part_num:02d}.sql")
        if os.path.exists(old_file):
            os.remove(old_file)
            print(f"  Removed old: seed-dishes-part-{part_num:02d}.sql")
            part_num += 1
        else:
            break

    return part_num - 1


def main():
    print("=" * 60)
    print("Fix seed-dishes.sql tuple data")
    print("=" * 60)

    # Step 1: Read the original file
    print(f"\nReading: {MAIN_FILE}")
    with open(MAIN_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Step 2: Fix '),,' (double comma after closing paren)
    content, dc_count = fix_double_comma(content)
    if dc_count > 0:
        print(f"\nFixed {dc_count} '),,' patterns -> '),'")
    else:
        print("\nNo '),,' patterns found.")

    # Step 3: Parse tuples and fix 24-value ones
    lines = content.split('\n')
    value_fixes, lines = find_and_fix_tuples(lines)

    if value_fixes:
        print(f"\nFixed {len(value_fixes)} tuples with 24 values:")
        for fix in value_fixes:
            print(f"  {fix}")
    else:
        print("\nNo 24-value tuples found.")

    # Reconstruct the fixed content
    fixed_content = '\n'.join(lines)

    # Step 4: Write the fixed content back
    with open(MAIN_FILE, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print(f"\nWrote fixed content to: {MAIN_FILE}")

    # Step 5: Verify - recount
    print("\n--- Verification ---")
    with open(MAIN_FILE, 'r', encoding='utf-8') as f:
        verify_content = f.read()

    # Check for '),,'
    remaining_dc = verify_content.count('),,')
    print(f"Remaining '),,' patterns: {remaining_dc}")

    # Re-parse to verify value counts
    verify_lines = verify_content.split('\n')
    # Quick check: find tuples and count values
    tuples_found = 0
    bad_tuples = []
    i = 0
    vn = len(verify_lines)
    while i < vn:
        stripped = verify_lines[i].strip()
        if stripped.startswith("(") and "'" in stripped:
            start = i
            j = i
            paren_depth = 0
            found_end = False
            while j < vn:
                l = verify_lines[j]
                for ci, ch in enumerate(l):
                    if ch == '(' and not _in_string(l, ci):
                        paren_depth += 1
                    elif ch == ')' and not _in_string(l, ci):
                        paren_depth -= 1
                        if paren_depth == 0:
                            tuple_text = "\n".join(verify_lines[start:j + 1])
                            ps = tuple_text.index('(')
                            pe = tuple_text.rindex(')')
                            tcontent = tuple_text[ps + 1:pe]
                            vc = count_tuple_values(tcontent)
                            tuples_found += 1
                            if vc != 25:
                                bad_tuples.append((start + 1, vc))
                            i = j + 1
                            found_end = True
                            break
                if found_end:
                    break
                j += 1
            if not found_end:
                i += 1
        else:
            i += 1

    print(f"Total tuples verified: {tuples_found}")
    if bad_tuples:
        print(f"Tuples NOT at 25 values: {len(bad_tuples)}")
        for line_num, vc in bad_tuples:
            print(f"  Line {line_num}: {vc} values")
    else:
        print("All tuples have exactly 25 values - PASS")

    # Step 6: Re-split into part files
    print("\n" + "=" * 60)
    print("Re-splitting into part files (50 tuples each)")
    print("=" * 60)
    num_parts = split_into_parts(fixed_content, tuples_per_part=50)
    print(f"\nTotal part files written: {num_parts}")

    print("\nDone!")


if __name__ == "__main__":
    main()
