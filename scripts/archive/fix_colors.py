import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    code = f.read()

# Update colors
code = code.replace('--bg-main: #1D1E27;', '--bg-main: #181B34;')
code = code.replace('--bg-sidebar: #292A36;', '--bg-sidebar: #292F4C;')
code = code.replace('--bg-panel: #292A36;', '--bg-panel: #292F4C;')
code = code.replace('--bg-table-header: #1D1E27;', '--bg-table-header: #181B34;')
code = code.replace('--bg-table-row: #1D1E27;', '--bg-table-row: #181B34;')
code = code.replace('--bg-table-row-hover: #292A36;', '--bg-table-row-hover: #292F4C;')

# Fix the top navbar
code = code.replace('background-color: #292A36;', 'background-color: #1D1E27;')

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(code)
