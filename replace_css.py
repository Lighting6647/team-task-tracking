import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace :root variables
new_root = """:root {
  --bg-main: #1D1E27;
  --bg-sidebar: #292A36;
  --bg-panel: #292A36;
  --bg-hover: rgba(255, 255, 255, 0.05);
  --bg-table-header: #1D1E27;
  --bg-table-row: #1D1E27;
  --bg-table-row-hover: #292A36;
  --border-color: #32333D;
  
  --text-main: #FFFFFF;
  --text-muted: #A1A3B4;
  
  --accent-blue: #0073ea;
  --accent-blue-hover: #0060b9;
  
  --group-color-1: #579bfc;
  --group-color-2: #c455de;
  --group-color-3: #e2445c;
  --group-color-4: #00c875;
}"""
css = re.sub(r':root\s*{[^}]+}', new_root, css)

# Replace body background
new_body = """body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-main);
  background-color: var(--bg-main);
  min-height: 100vh;
  overflow: hidden;
}"""
css = re.sub(r'body\s*{[^}]+}', new_body, css)

# Remove all backdrop-filter lines
css = re.sub(r'\s*backdrop-filter:[^;]+;', '', css)
css = re.sub(r'\s*-webkit-backdrop-filter:[^;]+;', '', css)

# Remove text-shadow from body if any
css = re.sub(r'\s*text-shadow:[^;]+;', '', css)

# Replace btn-primary
new_btn_primary = """.btn-primary {
  background: var(--accent-blue);
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  transition: all 0.1s ease;
}
.btn-primary:hover {
  background: var(--accent-blue-hover);
}"""
css = re.sub(r'\.btn-primary\s*{[^}]+}', '.btn-primary { TEMP }', css)
css = re.sub(r'\.btn-primary:hover\s*{[^}]+}', '', css)
css = css.replace('.btn-primary { TEMP }', new_btn_primary)

# Update sidebar and items
new_sidebar = """.sidebar {
  width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}
.sidebar-menu-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  margin: 0.1rem 0.5rem;
  color: var(--text-main);
  transition: background 0.1s;
}
.sidebar-menu-item:hover {
  background: var(--bg-hover);
}
.sidebar-menu-item.active {
  background: rgba(0, 115, 234, 0.2);
  color: var(--text-main);
}
"""
css = re.sub(r'\.sidebar\s*{[^}]+}', '.sidebar { TEMP }', css)
css = re.sub(r'\.sidebar-menu-item\s*{[^}]+}', '', css)
css = re.sub(r'\.sidebar-menu-item:hover\s*{[^}]+}', '', css)
css = re.sub(r'\.sidebar-menu-item\.active\s*{[^}]+}', '', css)
css = css.replace('.sidebar { TEMP }', new_sidebar)

# Table updates
new_table = """.monday-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.monday-table th {
  background: var(--bg-main);
  color: var(--text-muted);
  font-weight: 400;
  text-align: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}
.monday-table th:first-child, .monday-table td:first-child {
  border-left: 1px solid var(--border-color);
}
.monday-table th:last-child, .monday-table td:last-child {
  border-right: 1px solid var(--border-color);
}
.monday-table td {
  padding: 0;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  background: var(--bg-main);
  height: 36px;
}
.monday-table tr:hover td {
  background: var(--bg-table-row-hover);
}
"""
css = re.sub(r'\.monday-table\s*{[^}]+}', '.monday-table { TEMP }', css)
css = re.sub(r'\.monday-table th\s*{[^}]+}', '', css)
css = re.sub(r'\.monday-table td\s*{[^}]+}', '', css)
css = re.sub(r'\.monday-table tr:hover td\s*{[^}]+}', '', css)
css = css.replace('.monday-table { TEMP }', new_table)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
