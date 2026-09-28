import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove the top-navbar completely
top_nav_regex = r'      \{\/\* Global Navbar \*\/}.*?      <div className="app-container"'
code = re.sub(top_nav_regex, '      <div className="app-container"', code, flags=re.DOTALL)

# Ensure the app-container takes full height
code = code.replace('<div className="app-container" style={{ flex: 1, display: \'flex\', overflow: \'hidden\' }}>', 
                    '<div className="app-container" style={{ flex: 1, display: \'flex\', overflow: \'hidden\', height: \'100vh\' }}>')

# Make IT Onboarding the default active board, and do not allow selecting folders
code = code.replace("const [activeBoardId, setActiveBoardId] = useState(boards.find(b => b.type === 'grid')?.id || boards[0]?.id || null);",
                    "const [activeBoardId, setActiveBoardId] = useState('board-1');")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
