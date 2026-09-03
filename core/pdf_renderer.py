import os
import re
import markdown
from typing import Dict, Any, Optional

def render_beautiful_production_pdf_html(md_text: str, project_brief: Optional[Dict[str, Any]] = None) -> str:
    """
    Renders the master cinematic production bible into a breathtaking,
    publication-grade Hollywood Master Production PDF document.
    """
    brief = project_brief or {}
    title = (brief.get("title") or "UNTITLED CINEMATIC PROJECT").upper()
    genre = brief.get("genre") or "Cinematic Adventure / Sci-Fi"
    logline = brief.get("logline") or "A high-stakes cinematic narrative produced by Agentic Cinema Studio."
    
    # Priority: dynamic project budget first, then legacy key
    raw_budget = brief.get("budget") or brief.get("estimated_production_budget") or "$48,000,000"
    scale = brief.get("productionScale") or "Dynamic Budget"
    if "(" not in str(raw_budget):
        budget = f"{raw_budget} ({scale})"
    else:
        budget = str(raw_budget)

    format_str = brief.get("format") or "Theatrical Feature"
    episodes = brief.get("episodeCount")
    if episodes and int(episodes) > 1:
        format_display = f"{format_str} ({episodes} Episodes)"
    else:
        format_display = format_str

    audience = brief.get("targetAudience") or brief.get("target_audience") or "Global Theatrical, Streaming & TikTok Audiences"
    visual_style = brief.get("visualStyle") or brief.get("visual_style") or "High-contrast 35mm anamorphic realism with phosphor amber and neon cyan accents"
    color_palette = brief.get("colorPalette") or brief.get("color_palette") or "Deep Charcoal (#080A0F), Phosphor Amber (#FFB020), Neon Cyan (#00E5FF)"

    # Clean unparsed markdown characters from md_text before rendering
    cleaned_md = md_text
    # Remove redundant title header if already rendered on cover page
    cleaned_md = re.sub(r'^#\s+🎬\s+(?:HOLLYWOOD\s+)?MASTER CINEMATIC PRODUCTION BIBLE:.*?\n', '', cleaned_md, flags=re.MULTILINE)
    cleaned_md = re.sub(r'^#\s+🎬\s+MOMO MASTER CINEMATIC PRODUCTION BIBLE:.*?\n', '', cleaned_md, flags=re.MULTILINE)
    cleaned_md = re.sub(r'^>\s+\*\*Project ID:\*\*.*?\n', '', cleaned_md, flags=re.MULTILINE)
    
    # Strip inline backticks from headings and lists to prevent rogue code block formatting
    cleaned_md = re.sub(r'`([^`\n]+)`', r'\1', cleaned_md)

    # Use Python markdown with extensions
    converted_html = markdown.markdown(
        cleaned_md,
        extensions=['extra', 'tables', 'fenced_code', 'sane_lists']
    )

    # Format screenplay code blocks into authentic Hollywood scripts
    def format_screenplay_block(match):
        script_content = match.group(1)
        formatted_lines = []
        for l in script_content.splitlines():
            l_strip = l.strip()
            if not l_strip:
                formatted_lines.append('<div class="sc-blank"></div>')
            elif l_strip.startswith("INT.") or l_strip.startswith("EXT."):
                formatted_lines.append(f'<div class="sc-slugline">{l_strip}</div>')
            elif l_strip.startswith("SFX:") or l_strip.startswith("MUSIC:"):
                formatted_lines.append(f'<div class="sc-sfx">{l_strip}</div>')
            elif l_strip.isupper() and len(l_strip) < 40 and not l_strip.endswith(":"):
                formatted_lines.append(f'<div class="sc-character">{l_strip}</div>')
            elif l_strip.startswith("(") and l_strip.endswith(")"):
                formatted_lines.append(f'<div class="sc-parenthetical">{l_strip}</div>')
            else:
                formatted_lines.append(f'<div class="sc-dialogue">{l_strip}</div>')
        return f'<div class="screenplay-container">{"".join(formatted_lines)}</div>'

    clean_html = re.sub(r'<pre><code class="language-screenplay">(.*?)</code></pre>', format_screenplay_block, converted_html, flags=re.DOTALL)
    clean_html = re.sub(r'<pre><code>(.*?)</code></pre>', format_screenplay_block, clean_html, flags=re.DOTALL)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title} — Master Cinematic Production Package</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {{
      size: A4 portrait;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {{
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8.5pt;
        color: #94a3b8;
      }}
      @top-right {{
        content: "{title} • MASTER PRODUCTION BIBLE";
        font-family: 'Inter', sans-serif;
        font-size: 7.5pt;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }}
    }}

    * {{
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}

    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      line-height: 1.55;
      margin: 0;
      padding: 0;
      font-size: 10pt;
    }}

    .no-print {{
      position: sticky;
      top: 0;
      background: #090d16;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      z-index: 9999;
      border-bottom: 2px solid #00e5ff;
    }}

    .btn-download-pdf {{
      background: linear-gradient(135deg, #00e5ff, #0284c7);
      color: #050b14;
      font-weight: 800;
      font-size: 12.5px;
      border: none;
      padding: 9px 20px;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 229, 255, 0.4);
      transition: all 0.2s;
    }}
    .btn-download-pdf:hover {{
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 229, 255, 0.6);
    }}

    .pdf-document {{
      max-width: 860px;
      margin: 30px auto;
      background: #ffffff;
      padding: 44px 52px;
      border-radius: 10px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.06);
    }}

    /* Title Cover Page */
    .cover-page {{
      text-align: center;
      padding: 50px 20px 40px 20px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 40px;
      page-break-after: always;
    }}

    .cover-badge {{
      display: inline-block;
      background: #0f172a;
      color: #38bdf8;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 2px;
      padding: 5px 16px;
      border-radius: 20px;
      text-transform: uppercase;
      margin-bottom: 22px;
    }}

    .cover-title {{
      font-family: 'Cinzel', serif;
      font-size: 30pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.15;
      margin: 0 0 14px 0;
      letter-spacing: 1px;
    }}

    .cover-genre {{
      font-size: 11pt;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 26px;
    }}

    .cover-logline {{
      font-size: 11.5pt;
      font-style: italic;
      color: #1e293b;
      background: #f8fafc;
      border-left: 4px solid #0284c7;
      padding: 16px 22px;
      border-radius: 0 8px 8px 0;
      max-width: 700px;
      margin: 0 auto 36px auto;
      text-align: left;
      line-height: 1.6;
    }}

    .meta-table {{
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      border-collapse: collapse;
      text-align: left;
      font-size: 9.5pt;
    }}

    .meta-table td {{
      padding: 9px 14px;
      border-bottom: 1px solid #e2e8f0;
    }}

    .meta-table td:first-child {{
      font-weight: 700;
      color: #64748b;
      width: 32%;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }}

    .meta-table td:last-child {{
      color: #0f172a;
      font-weight: 600;
    }}

    /* Typography & Headings */
    h1 {{
      font-family: 'Cinzel', serif;
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 14px;
      page-break-before: always;
      page-break-after: avoid;
    }}

    h2 {{
      font-size: 12pt;
      font-weight: 800;
      color: #0369a1;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }}

    h3 {{
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }}

    h4 {{
      font-size: 10pt;
      font-weight: 700;
      color: #475569;
      margin-top: 12px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }}

    p {{
      margin: 5px 0 8px 0;
      color: #334155;
      text-align: justify;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }}

    ul, ol {{
      margin: 4px 0 10px 0;
      padding-left: 20px;
    }}

    li {{
      margin-bottom: 4px;
      color: #334155;
    }}

    strong {{
      color: #0f172a;
      font-weight: 700;
    }}

    blockquote {{
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      margin: 10px 0;
      padding: 8px 16px;
      font-style: italic;
      color: #334155;
      border-radius: 0 6px 6px 0;
    }}

    hr {{
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 22px 0;
    }}

    /* Hollywood Screenplay Standard Styling */
    .screenplay-container {{
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 20px 24px;
      margin: 14px 0 20px 0;
      font-family: 'Courier Prime', Courier, monospace;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #000000;
      page-break-inside: auto;
    }}

    .sc-blank {{
      height: 10px;
    }}

    .sc-slugline {{
      font-weight: 700;
      text-transform: uppercase;
      margin: 12px 0 6px 0;
      letter-spacing: 0.5px;
      color: #000000;
    }}

    .sc-character {{
      font-weight: 700;
      text-transform: uppercase;
      text-align: center;
      margin: 10px 0 1px 0;
      width: 100%;
      letter-spacing: 1px;
    }}

    .sc-parenthetical {{
      font-style: italic;
      text-align: center;
      margin-bottom: 1px;
      color: #475569;
    }}

    .sc-dialogue {{
      margin: 0 auto 6px auto;
      max-width: 420px;
      text-align: left;
    }}

    .sc-sfx {{
      font-weight: 700;
      font-style: italic;
      margin: 6px 0;
      color: #0369a1;
    }}

    /* Print Specific Tweaks */
    @media print {{
      body {{
        background: #ffffff !important;
        font-size: 9.5pt;
      }}
      .no-print {{
        display: none !important;
      }}
      .pdf-document {{
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }}
      .cover-page {{
        padding-top: 30px !important;
        page-break-after: always !important;
      }}
      h1 {{
        page-break-before: always !important;
      }}
      .screenplay-container {{
        background: #ffffff !important;
        border: 1px solid #94a3b8 !important;
      }}
    }}
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="font-size:14px; letter-spacing:1px; color:#00e5ff;">🎬 AGENTIC CINEMA STUDIO</strong>
      <span style="color:#94a3b8; font-size:12px; margin-left:12px;">Hollywood Feature Master Production Bible (100+ Pages)</span>
      <span style="background:rgba(0,229,255,0.15); color:#00e5ff; border:1px solid rgba(0,229,255,0.4); border-radius:4px; font-size:10px; font-weight:700; padding:2px 8px; margin-left:10px; font-family:monospace;">100+ PAGES ARCHIVAL EDITION</span>
    </div>
    <button class="btn-download-pdf" onclick="window.print()">
      📄 PRINT / SAVE AS 100-PAGE PDF
    </button>
  </div>

  <div class="pdf-document">
    <!-- Cover Page -->
    <div class="cover-page">
      <div class="cover-badge">Official Master Studio Production Document</div>
      <h1 class="cover-title" style="page-break-before:avoid; border:none;">{title}</h1>
      <div class="cover-genre">{genre}</div>
      <div class="cover-logline">"{logline}"</div>

      <table class="meta-table">
        <tr>
          <td>Production Format</td>
          <td>{format_display}</td>
        </tr>
        <tr>
          <td>Estimated Budget</td>
          <td>{budget}</td>
        </tr>
        <tr>
          <td>Target Demographics</td>
          <td>{audience}</td>
        </tr>
        <tr>
          <td>Visual Style</td>
          <td>{visual_style}</td>
        </tr>
        <tr>
          <td>Color Palette</td>
          <td>{color_palette}</td>
        </tr>
        <tr>
          <td>Studio Engine</td>
          <td>Gemini 3.5+ Flagship Multi-Agent Architecture</td>
        </tr>
      </table>
    </div>

    <!-- Master Bible Body -->
    {clean_html}
  </div>
</body>
</html>"""
