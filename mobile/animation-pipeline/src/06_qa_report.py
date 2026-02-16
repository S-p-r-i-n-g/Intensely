#!/usr/bin/env python3
"""
Generate QA Review HTML for visual inspection of all animations.

Creates an interactive grid view with:
- All rendered animations displayed
- Filters by movement pattern, category, camera angle
- "Needs Rework" checkboxes
- Export rework list as JSON

Usage:
    python 06_qa_report.py
"""

import json
import base64
from pathlib import Path
from datetime import datetime


def load_manifest():
    """Load manifest with exercise metadata."""
    manifest_path = Path(__file__).parent.parent / "manifest.json"
    if not manifest_path.exists():
        raise FileNotFoundError(f"{manifest_path} not found")

    with open(manifest_path) as f:
        return json.load(f)


def get_webp_files(webp_dir):
    """Get list of available WebP files."""
    return {f.stem: f for f in webp_dir.glob("*.webp")}


def generate_html(manifest, webp_files, output_path):
    """Generate interactive HTML QA report."""

    exercises = manifest['exercises']
    total_count = len(exercises)
    rendered_count = len(webp_files)

    # Collect unique values for filters
    movement_patterns = sorted(set(ex['movement_pattern'] for ex in exercises.values()))
    camera_angles = sorted(set(ex['camera_angle'] for ex in exercises.values()))

    # Build exercise data for JavaScript
    exercise_data = []
    for slug, ex_data in sorted(exercises.items()):
        has_animation = slug in webp_files
        file_size = webp_files[slug].stat().st_size / 1024 if has_animation else 0

        exercise_data.append({
            'slug': slug,
            'name': slug.replace('-', ' ').title(),
            'movement_pattern': ex_data['movement_pattern'],
            'camera_angle': ex_data['camera_angle'],
            'word_count': ex_data['word_count'],
            'enriched': ex_data.get('enriched', False),
            'has_animation': has_animation,
            'file_size_kb': round(file_size, 1) if has_animation else 0,
            'animation_path': f'webp/{slug}.webp' if has_animation else None
        })

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animation QA Review - {rendered_count}/{total_count} Rendered</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            padding: 2rem;
        }}

        .header {{
            background: #1e293b;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }}

        h1 {{
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #3b82f6;
        }}

        .stats {{
            display: flex;
            gap: 2rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }}

        .stat {{
            background: #0f172a;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid #334155;
        }}

        .stat-value {{
            font-size: 2rem;
            font-weight: bold;
            color: #3b82f6;
        }}

        .stat-label {{
            font-size: 0.875rem;
            color: #94a3b8;
            margin-top: 0.25rem;
        }}

        .controls {{
            background: #1e293b;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            align-items: center;
        }}

        .filter-group {{
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }}

        label {{
            font-size: 0.875rem;
            color: #94a3b8;
            font-weight: 500;
        }}

        select, input {{
            background: #0f172a;
            color: #e2e8f0;
            border: 1px solid #334155;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            min-width: 150px;
        }}

        select:focus, input:focus {{
            outline: none;
            border-color: #3b82f6;
        }}

        button {{
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }}

        button:hover {{
            background: #2563eb;
        }}

        button.secondary {{
            background: #64748b;
        }}

        button.secondary:hover {{
            background: #475569;
        }}

        button.export {{
            background: #10b981;
        }}

        button.export:hover {{
            background: #059669;
        }}

        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }}

        .card {{
            background: #1e293b;
            border-radius: 12px;
            padding: 1rem;
            border: 2px solid transparent;
            transition: all 0.2s;
            position: relative;
        }}

        .card:hover {{
            border-color: #3b82f6;
            transform: translateY(-2px);
        }}

        .card.needs-rework {{
            border-color: #ef4444;
            background: #1e1b1b;
        }}

        .card.missing {{
            opacity: 0.5;
            border-color: #64748b;
        }}

        .animation-container {{
            width: 100%;
            height: 200px;
            background: #0f172a;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            position: relative;
            overflow: hidden;
        }}

        .animation-container img {{
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }}

        .missing-label {{
            color: #64748b;
            font-size: 0.875rem;
            text-align: center;
        }}

        .card-title {{
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #e2e8f0;
        }}

        .card-meta {{
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.75rem;
            color: #94a3b8;
            margin-bottom: 1rem;
        }}

        .badge {{
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            background: #0f172a;
            border: 1px solid #334155;
        }}

        .badge.enriched {{
            background: #065f46;
            border-color: #10b981;
            color: #6ee7b7;
        }}

        .checkbox-group {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: #0f172a;
            border-radius: 6px;
            cursor: pointer;
            user-select: none;
        }}

        .checkbox-group:hover {{
            background: #1e293b;
        }}

        input[type="checkbox"] {{
            width: 18px;
            height: 18px;
            cursor: pointer;
            min-width: auto;
        }}

        .checkbox-label {{
            font-size: 0.875rem;
            font-weight: 500;
            color: #e2e8f0;
        }}

        .rework-count {{
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            z-index: 1000;
            display: none;
        }}

        .rework-count.visible {{
            display: block;
        }}

        .export-container {{
            display: flex;
            gap: 1rem;
            margin-left: auto;
        }}

        .angle-badge {{
            background: #1e3a8a;
            border-color: #3b82f6;
            color: #93c5fd;
        }}

        .results-summary {{
            padding: 1rem;
            background: #1e293b;
            border-radius: 8px;
            margin-bottom: 1rem;
            color: #94a3b8;
            font-size: 0.875rem;
        }}

        @media (max-width: 768px) {{
            .controls {{
                flex-direction: column;
                align-items: stretch;
            }}

            .export-container {{
                margin-left: 0;
                flex-direction: column;
            }}

            .grid {{
                grid-template-columns: 1fr;
            }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🎬 Animation QA Review</h1>
        <p style="color: #94a3b8; margin-top: 0.5rem;">
            Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        </p>
        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="total-count">{total_count}</div>
                <div class="stat-label">Total Exercises</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="rendered-count">{rendered_count}</div>
                <div class="stat-label">Rendered</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="missing-count">{total_count - rendered_count}</div>
                <div class="stat-label">Missing</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="rework-stat">0</div>
                <div class="stat-label">Needs Rework</div>
            </div>
        </div>
    </div>

    <div class="controls">
        <div class="filter-group">
            <label for="search">Search</label>
            <input type="text" id="search" placeholder="Filter by name...">
        </div>

        <div class="filter-group">
            <label for="movement-filter">Movement Pattern</label>
            <select id="movement-filter">
                <option value="">All Patterns</option>
                {"".join(f'<option value="{p}">{p.title()}</option>' for p in movement_patterns)}
            </select>
        </div>

        <div class="filter-group">
            <label for="angle-filter">Camera Angle</label>
            <select id="angle-filter">
                <option value="">All Angles</option>
                {"".join(f'<option value="{a}">{a}°</option>' for a in camera_angles)}
            </select>
        </div>

        <div class="filter-group">
            <label for="status-filter">Status</label>
            <select id="status-filter">
                <option value="">All</option>
                <option value="rendered">Rendered</option>
                <option value="missing">Missing</option>
                <option value="rework">Needs Rework</option>
            </select>
        </div>

        <div class="export-container">
            <button class="secondary" onclick="resetFilters()">Reset Filters</button>
            <button class="secondary" onclick="clearRework()">Clear Rework</button>
            <button class="export" onclick="exportReworkList()">📥 Export Rework List</button>
        </div>
    </div>

    <div class="results-summary" id="results-summary">
        Showing <strong id="visible-count">0</strong> of <strong>{total_count}</strong> exercises
    </div>

    <div class="grid" id="animation-grid"></div>

    <div class="rework-count" id="rework-badge">
        <span id="rework-count-text">0 exercises need rework</span>
    </div>

    <script>
        const exercises = {json.dumps(exercise_data, indent=2)};
        let reworkList = new Set();

        // Initialize from localStorage
        const savedRework = localStorage.getItem('reworkList');
        if (savedRework) {{
            reworkList = new Set(JSON.parse(savedRework));
        }}

        function renderGrid() {{
            const grid = document.getElementById('animation-grid');
            const searchTerm = document.getElementById('search').value.toLowerCase();
            const movementFilter = document.getElementById('movement-filter').value;
            const angleFilter = document.getElementById('angle-filter').value;
            const statusFilter = document.getElementById('status-filter').value;

            // Filter exercises
            const filtered = exercises.filter(ex => {{
                if (searchTerm && !ex.name.toLowerCase().includes(searchTerm)) return false;
                if (movementFilter && ex.movement_pattern !== movementFilter) return false;
                if (angleFilter && ex.camera_angle !== parseInt(angleFilter)) return false;
                if (statusFilter === 'rendered' && !ex.has_animation) return false;
                if (statusFilter === 'missing' && ex.has_animation) return false;
                if (statusFilter === 'rework' && !reworkList.has(ex.slug)) return false;
                return true;
            }});

            // Update visible count
            document.getElementById('visible-count').textContent = filtered.length;

            // Render cards
            grid.innerHTML = filtered.map(ex => {{
                const needsRework = reworkList.has(ex.slug);
                const cardClass = needsRework ? 'needs-rework' : (ex.has_animation ? '' : 'missing');

                return `
                    <div class="card ${{cardClass}}" data-slug="${{ex.slug}}">
                        <div class="animation-container">
                            ${{ex.has_animation
                                ? `<img src="${{ex.animation_path}}" alt="${{ex.name}}" loading="lazy">`
                                : '<div class="missing-label">⚠️ Animation Missing</div>'
                            }}
                        </div>
                        <div class="card-title">${{ex.name}}</div>
                        <div class="card-meta">
                            <div>
                                <span class="badge">${{ex.movement_pattern}}</span>
                                <span class="badge angle-badge">${{ex.camera_angle}}°</span>
                                ${{ex.enriched ? '<span class="badge enriched">Enriched</span>' : ''}}
                            </div>
                            ${{ex.has_animation ? `<div>Size: ${{ex.file_size_kb}} KB</div>` : ''}}
                            <div>${{ex.word_count}} words in prompt</div>
                        </div>
                        <div class="checkbox-group" onclick="toggleRework('${{ex.slug}}')">
                            <input type="checkbox"
                                   id="rework-${{ex.slug}}"
                                   ${{needsRework ? 'checked' : ''}}
                                   onclick="event.stopPropagation()">
                            <label class="checkbox-label" for="rework-${{ex.slug}}">
                                Needs Rework
                            </label>
                        </div>
                    </div>
                `;
            }}).join('');
        }}

        function toggleRework(slug) {{
            if (reworkList.has(slug)) {{
                reworkList.delete(slug);
            }} else {{
                reworkList.add(slug);
            }}

            // Save to localStorage
            localStorage.setItem('reworkList', JSON.stringify([...reworkList]));

            // Update UI
            updateReworkCount();
            renderGrid();
        }}

        function updateReworkCount() {{
            const count = reworkList.size;
            document.getElementById('rework-stat').textContent = count;
            document.getElementById('rework-count-text').textContent =
                `${{count}} exercise${{count !== 1 ? 's' : ''}} need${{count === 1 ? 's' : ''}} rework`;

            const badge = document.getElementById('rework-badge');
            if (count > 0) {{
                badge.classList.add('visible');
            }} else {{
                badge.classList.remove('visible');
            }}
        }}

        function exportReworkList() {{
            if (reworkList.size === 0) {{
                alert('No exercises marked for rework');
                return;
            }}

            const reworkData = {{
                exported_at: new Date().toISOString(),
                count: reworkList.size,
                exercises: [...reworkList].map(slug => {{
                    const ex = exercises.find(e => e.slug === slug);
                    return {{
                        slug: slug,
                        name: ex.name,
                        movement_pattern: ex.movement_pattern,
                        camera_angle: ex.camera_angle,
                        has_animation: ex.has_animation,
                        prompt_file: `prompts/${{slug}}.txt`
                    }};
                }})
            }};

            // Create download
            const blob = new Blob([JSON.stringify(reworkData, null, 2)], {{
                type: 'application/json'
            }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rework-list-${{new Date().toISOString().split('T')[0]}}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert(`Exported ${{reworkList.size}} exercises for rework`);
        }}

        function clearRework() {{
            if (reworkList.size === 0) return;

            if (confirm(`Clear all ${{reworkList.size}} exercises from rework list?`)) {{
                reworkList.clear();
                localStorage.removeItem('reworkList');
                updateReworkCount();
                renderGrid();
            }}
        }}

        function resetFilters() {{
            document.getElementById('search').value = '';
            document.getElementById('movement-filter').value = '';
            document.getElementById('angle-filter').value = '';
            document.getElementById('status-filter').value = '';
            renderGrid();
        }}

        // Event listeners
        document.getElementById('search').addEventListener('input', renderGrid);
        document.getElementById('movement-filter').addEventListener('change', renderGrid);
        document.getElementById('angle-filter').addEventListener('change', renderGrid);
        document.getElementById('status-filter').addEventListener('change', renderGrid);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {{
            if (e.key === 'e' && e.ctrlKey) {{
                e.preventDefault();
                exportReworkList();
            }}
            if (e.key === 'r' && e.ctrlKey) {{
                e.preventDefault();
                resetFilters();
            }}
        }});

        // Initial render
        updateReworkCount();
        renderGrid();
    </script>
</body>
</html>
"""

    # Write HTML file
    with open(output_path, 'w') as f:
        f.write(html_content)


def main():
    """Generate QA report."""
    print("=" * 60)
    print("Exercise Animation Pipeline - QA Report Generator")
    print("=" * 60)

    # Load data
    manifest = load_manifest()
    print("✓ Loaded manifest.json")

    # Find WebP files
    webp_dir = Path(__file__).parent.parent / "output" / "webp"
    if not webp_dir.exists():
        print(f"\n❌ WebP directory not found: {webp_dir}")
        print("   Run 04_render_webp.py first.")
        return

    webp_files = get_webp_files(webp_dir)
    print(f"✓ Found {len(webp_files)} WebP animations")

    # Generate HTML
    output_path = Path(__file__).parent.parent / "output" / "qa_review.html"
    generate_html(manifest, webp_files, output_path)

    print(f"✓ Generated QA review: {output_path}")
    print("\n" + "=" * 60)
    print("QA REVIEW READY")
    print("=" * 60)
    print(f"\nOpen in browser: file://{output_path.absolute()}")
    print("\nFeatures:")
    print("  • Visual grid of all animations")
    print("  • Filter by movement pattern, angle, status")
    print("  • Mark exercises for rework")
    print("  • Export rework list as JSON")
    print("  • Keyboard shortcuts: Ctrl+E (export), Ctrl+R (reset)")
    print("\nRework list persists in browser localStorage")
    print("=" * 60)


if __name__ == "__main__":
    main()
