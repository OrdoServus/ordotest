import json
import os
import sys
from datetime import datetime

print("--- Starting external Python script for changelog update ---")

# --- German Month mapping for date formatting ---
mons_de = {
    1: 'Januar', 2: 'Februar', 3: 'März', 4: 'April', 5: 'Mai', 6: 'Juni',
    7: 'Juli', 8: 'August', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember'
}

def get_env_variable(name):
    var = os.environ.get(name)
    if not var:
        print(f"Error: Environment variable {name} is not set.", file=sys.stderr)
        sys.exit(1)
    return var

def format_date(iso_date):
    if not iso_date or iso_date == 'null':
        print("Warning: No valid release date (published_at) found. Falling back to current date.", file=sys.stderr)
        now = datetime.now()
        return f"{now.day}. {mons_de[now.month]} {now.year}"
    try:
        dt_object = datetime.fromisoformat(iso_date.replace('Z', '+00:00'))
        formatted_date = f"{dt_object.day}. {mons_de[dt_object.month]} {dt_object.year}"
        print(f"Successfully formatted date to: {formatted_date}")
        return formatted_date
    except (ValueError, TypeError, KeyError) as e:
        print(f"Warning: Could not parse date '{iso_date}'. Error: {e}. Falling back to current date.", file=sys.stderr)
        now = datetime.now()
        return f"{now.day}. {mons_de[now.month]} {now.year}"

def main():
    # --- Get data from environment variables ---
    version = get_env_variable('VERSION')
    title = get_env_variable('TITLE')
    body = get_env_variable('BODY')
    iso_date = os.environ.get('DATE_ISO') # Can be optional

    print(f"Reading data: Version={version}, Title={title}, ISO_Date={iso_date}")

    # --- Prepare changelog entry ---
    formatted_date = format_date(iso_date)
    changes = [line.strip().lstrip('- ').lstrip('* ') for line in body.splitlines() if line.strip() and not line.strip().startswith('---')]
    new_entry = {
        'version': version.lstrip('v'),
        'date': formatted_date,
        'title': title,
        'changes': changes
    }

    # --- Read, Update, and Write JSON file ---
    file_path = 'updates.json'
    data = []
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if content:
                    data = json.loads(content)
                else:
                    print(f"Warning: {file_path} was empty.")
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not read or parse {file_path}. A new file will be created. Error: {e}", file=sys.stderr)

    data.insert(0, new_entry)

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data[:20], f, indent=2, ensure_ascii=False)
        print(f"Successfully updated {file_path} for version {version}")
    except IOError as e:
        print(f"Error: Could not write to {file_path}. Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
