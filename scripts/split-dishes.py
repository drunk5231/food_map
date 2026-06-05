"""
Split seed-dishes.sql into multiple smaller INSERT statements (50 rows each).
"""
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, "seed-dishes.sql")
CHUNK_SIZE = 50

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 1. Find the INSERT INTO line index
insert_line_idx = None
for i, line in enumerate(lines):
    if line.strip().startswith("INSERT INTO"):
        insert_line_idx = i
        break

if insert_line_idx is None:
    raise ValueError("Could not find INSERT INTO line")

# 2. Find the ON CONFLICT line index (skip comment lines)
on_conflict_idx = None
for i, line in enumerate(lines):
    if "ON CONFLICT" in line and not line.strip().startswith("--"):
        on_conflict_idx = i
        break

if on_conflict_idx is None:
    raise ValueError("Could not find ON CONFLICT line")

# Header = lines before INSERT + INSERT line itself
header_lines = lines[: insert_line_idx + 1]
header = "".join(header_lines).rstrip("\n")

# Footer = ON CONFLICT line (and any trailing content)
footer = lines[on_conflict_idx].rstrip("\n")

# Data = everything between INSERT and ON CONFLICT
data_lines = lines[insert_line_idx + 1 : on_conflict_idx]

# 3. Parse data into individual tuples
# A tuple starts with a line whose stripped version starts with '(' and is not a comment
# A tuple ends when we encounter a line ending with ')' or '),'
tuples = []
current_tuple = []
in_tuple = False

for line in data_lines:
    stripped = line.strip()

    if not in_tuple:
        # Skip blank lines and comment lines outside tuples
        if stripped == "" or stripped.startswith("--"):
            continue
        if stripped.startswith("("):
            in_tuple = True
            current_tuple = [line]
            # Check if single-line tuple
            if stripped.endswith("),") or stripped.endswith(")"):
                tuples.append("".join(current_tuple).rstrip("\n"))
                current_tuple = []
                in_tuple = False
    else:
        current_tuple.append(line)
        # Check if this line ends the tuple
        if stripped.endswith("),") or stripped.endswith(")"):
            tuples.append("".join(current_tuple).rstrip("\n"))
            current_tuple = []
            in_tuple = False

if current_tuple:
    tuples.append("".join(current_tuple).rstrip("\n"))

print(f"Found {len(tuples)} dish entries")

# 4. Split into chunks and write files
num_parts = (len(tuples) + CHUNK_SIZE - 1) // CHUNK_SIZE
print(f"Splitting into {num_parts} parts of up to {CHUNK_SIZE} rows each\n")

for part_num in range(num_parts):
    start = part_num * CHUNK_SIZE
    end = min(start + CHUNK_SIZE, len(tuples))
    chunk = tuples[start:end]

    # Ensure the last row ends with ')' not '),'
    last = chunk[-1].rstrip()
    if last.endswith("),"):
        chunk[-1] = last[:-1]

    # Build the output
    rows_text = "\n".join(chunk)
    output = header + "\n\n" + rows_text + "\n\n" + footer + "\n"

    part_filename = f"seed-dishes-part-{part_num + 1:02d}.sql"
    part_path = os.path.join(SCRIPT_DIR, part_filename)

    with open(part_path, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"  {part_filename}: rows {start+1}-{end} ({len(chunk)} rows)")

print(f"\nDone! Created {num_parts} part files in {SCRIPT_DIR}")
