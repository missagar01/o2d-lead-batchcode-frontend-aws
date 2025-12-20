from pathlib import Path
import sys
text = Path(sys.argv[1]).read_text()
for i, line in enumerate(text.splitlines(), 1):
    print(f\"{i}:{line}\")
