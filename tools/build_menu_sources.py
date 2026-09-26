#!/usr/bin/env python3
"""Build checked-in compatibility files without changing scope or evaluation order."""
import argparse, hashlib, json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()

def assemble(root=ROOT):
    manifest = json.loads((root/'src/menu-build.json').read_text())
    blocks = {}
    for file in manifest['block_files']:
        text = (root/file).read_text()
        pattern = (r'<!-- EOT_PART ([\w.-]+) -->\n(.*?)\n<!-- EOT_END -->\n'
                   if file.endswith('.html') else r'/\* EOT_PART ([\w.-]+) \*/\n(.*?)\n/\* EOT_END \*/\n')
        matches = list(re.finditer(pattern, text, re.S))
        if ''.join(m.group() for m in matches) != text:
            raise ValueError('Unmarked content in '+file)
        for match in matches:
            key, content = match.groups()
            if key in blocks: raise ValueError('Duplicate block '+key)
            blocks[key] = content
    used = []
    outputs = {}
    for file, recipe in manifest['outputs'].items():
        if 'copy' in recipe:
            outputs[file] = (root/recipe['copy']).read_text()
        else:
            used.extend(recipe['parts'])
            outputs[file] = ''.join(blocks[key] for key in recipe['parts'])
    used.extend(manifest['html_order'])
    html = ''.join(blocks[key] for key in manifest['html_order'])
    # Preserve the existing six HTTP requests and their original boundary lengths.
    start = 0
    for i, size in enumerate(manifest['html_chunk_sizes'], 1):
        end = start + size if i < len(manifest['html_chunk_sizes']) else len(html)
        outputs[f'content-{i}.html'] = html[start:end]
        start = end
    if len(used) != len(set(used)) or set(used) != set(blocks):
        raise ValueError('Missing or repeated source block in build order')
    return outputs

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--baseline', action='store_true', help='Verify the one-time migration against v222')
    args = parser.parse_args()
    outputs = assemble()
    if args.baseline:
        expected = json.loads((ROOT/'src/migration-baseline.json').read_text())
        for file, text in outputs.items():
            if digest(text) != expected[file]: raise SystemExit('Migration changed '+file)
    changed = [file for file,text in outputs.items() if not (ROOT/file).exists() or (ROOT/file).read_text() != text]
    if args.check and changed: raise SystemExit('Run python tools/build_menu_sources.py: '+', '.join(changed))
    if not args.check:
        for file in changed: (ROOT/file).write_text(outputs[file])
    print(f'{len(outputs)} runtime files verified; {len(changed)} changes'+(' (check only)' if args.check else ''))

if __name__ == '__main__': main()
