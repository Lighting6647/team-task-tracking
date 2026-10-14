with open('src/index.css', 'a', encoding='utf-8') as f:
    f.write("""
/* Refine status badge for Monday look */
.cell-content.cell-center {
  padding: 0;
}
.status-badge {
  width: 100%;
  height: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-badge.status-empty {
  color: transparent;
}
.status-badge.status-empty:hover {
  color: white;
}
""")
