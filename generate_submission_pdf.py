import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def generate_submission_pdf(output_path="ENAM_AI_Engineer_Challenge_FINN_Submission.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0F172A")    # Deep slate
    accent_color = colors.HexColor("#0D9488")     # Teal accent
    secondary_color = colors.HexColor("#334155")  # Muted slate
    bg_card_color = colors.HexColor("#F8FAFC")    # Clean surface tint
    border_color = colors.HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=accent_color,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=secondary_color,
        alignment=TA_LEFT,
        spaceAfter=7
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=secondary_color,
        leftIndent=14,
        spaceAfter=4
    )

    link_box_style = ParagraphStyle(
        'LinkBox',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=accent_color,
        alignment=TA_CENTER
    )

    table_header_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=primary_color
    )

    story = []

    # Title & Header
    story.append(Paragraph("ENAM Holdings — AI Engineer Build Challenge", title_style))
    story.append(Paragraph("FINN: Financial Investment Agent · Submission Dossier & Covering Note", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=12))

    # Meta Info Table
    meta_data = [
        [
            Paragraph("<b>Subject:</b> ENAM - IIT screening - 2027", body_style),
            Paragraph("<b>Candidate Role:</b> AI Engineer", body_style)
        ],
        [
            Paragraph("<b>Submission Email:</b> assessment@enam.com", body_style),
            Paragraph("<b>Date:</b> November 2026", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_card_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Live Production Deployment Link Banner
    live_url = "https://finn-assigbnment-1f4bztefw-vaibhav-guptas-projects-b910ed08.vercel.app/brief"
    banner_data = [
        [
            Paragraph(f"<b>LIVE DEPLOYED MOBILE APP (PROTOTYPE):</b><br/><a href='{live_url}' color='#0D9488'><u>{live_url}</u></a>", link_box_style)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[520])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#CCFBF1")),
        ('BOX', (0,0), (-1,-1), 1, accent_color),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 12))

    # Section 1: Executive Overview & The Problem
    story.append(Paragraph("1. Executive Overview & Problem Addressed", h1_style))
    story.append(Paragraph(
        "Public-markets equity investors are inundated daily by thousands of routine exchange filings, noisy price swings, and generic broker commentary. "
        "The scarce skill in public-market investing is not data aggregation; it is <b>curation and auditability</b>: separating signal from noise, "
        "quantifying management credibility, and presenting actionable primary disclosures in a focused 60-second morning workflow.",
        body_style
    ))
    story.append(Paragraph(
        "<b>FINN</b> was built from the ground up as a mobile-first, high-density financial terminal that rejects 'AI slop' "
        "(unformatted LLM hallucinations and purple-gradient templates) in favor of calm editorial finance. It operates cleanly in two modes: "
        "<b>Push</b> (proactively filtering what changed across the portfolio) and <b>Pull</b> (grounded, on-demand primary source research).",
        body_style
    ))

    # Section 2: Flagship Workflows
    story.append(Paragraph("2. Flagship Workflows & Differentiating Capabilities", h1_style))
    story.append(Paragraph(
        "<b>A. Promised vs. Delivered Scorecard (Pull Flagship ⭐):</b><br/>"
        "Rather than just summarizing earnings calls, FINN extracts management's explicit historical promises (revenue, EBITDA margin, capex, store additions) "
        "with verbatim quotes and page citations from the last 4 concall transcripts. It then automatically cross-audits those commitments against "
        "subsequent audited financials and quarterly results tables. Gemini 2.5 Pro synthesizes an objective <b>Executive Credibility Score</b> (e.g. <i>8/10 Met</i>) "
        "and highlights exactly where narrative diverged from reality.",
        bullet_style
    ))
    story.append(Paragraph(
        "<b>B. Materiality-Ranked Daily Brief (Push Mode):</b><br/>"
        "Exchange filings are prioritized by a rigorous mathematical scoring function (<i>priority = category_weight × materiality × position_weight</i>). "
        "Routine ESOP allotments and trading window notices are collapsed into compact counters. High-impact disclosures expand into custom cards: "
        "Quarterly results show 4-row mini tables (Revenue, EBITDA/NII, PBT, PAT) with QoQ and YoY deltas and basis-point margin comments; "
        "C-suite management changes pull verified career profiles from SEBI annexures and live search.",
        bullet_style
    ))
    story.append(Paragraph(
        "<b>C. Threshold Triggers & Correlated 'Why It Moved':</b><br/>"
        "Investors set personalized thresholds for volume multipliers (e.g. >2.0x 20-day trailing avg) and 1-day price swings (±5%). "
        "When an unusual move triggers, FINN correlates it against filings from the same 24-48h window to immediately answer <i>'Why it moved'</i>.",
        bullet_style
    ))

    # Section 3: Smart Model Routing & Cost Efficiency
    story.append(Paragraph("3. Architectural Cost Efficiency & Model Routing", h1_style))
    story.append(Paragraph(
        "To maximize intelligence while maintaining near-zero operating costs on serverless tiers, FINN implements tiered model routing with SHA-256 caching:",
        body_style
    ))

    routing_data = [
        [
            Paragraph("<b>Pipeline Task</b>", table_header_style),
            Paragraph("<b>Model / Engine</b>", table_header_style),
            Paragraph("<b>Architectural Justification</b>", table_header_style),
            Paragraph("<b>Unit Cost</b>", table_header_style)
        ],
        [
            Paragraph("Filing Classification", table_cell_style),
            Paragraph("Rule-based Taxonomy", table_cell_style),
            Paragraph("Deterministic keyword/BSE mapping filters 85% of filings without LLM calls.", table_cell_style),
            Paragraph("₹0.00", table_cell_style)
        ],
        [
            Paragraph("Ambiguous Disclosures", table_cell_style),
            Paragraph("Gemini 2.5 Flash", table_cell_style),
            Paragraph("High-speed classification, one-liner summaries (≤18 words), results extraction.", table_cell_style),
            Paragraph("~₹0.005", table_cell_style)
        ],
        [
            Paragraph("Promised vs Delivered", table_cell_style),
            Paragraph("Gemini 2.5 Pro", table_cell_style),
            Paragraph("Deep reasoning reconciling verbatim concall claims against audited reports.", table_cell_style),
            Paragraph("~₹0.75", table_cell_style)
        ],
        [
            Paragraph("Vector Retrieval", table_cell_style),
            Paragraph("Gemini Embeddings", table_cell_style),
            Paragraph("Selective chunking of high-signal AR sections (MD&A, Auditor notes, Segments).", table_cell_style),
            Paragraph("~₹0.001", table_cell_style)
        ]
    ]

    routing_table = Table(routing_data, colWidths=[110, 100, 240, 70])
    routing_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(routing_table)
    story.append(Spacer(1, 10))

    # Section 4: Covering Note & Key Decisions
    story.append(Paragraph("4. Technical Decisions, Trade-Offs & Roadmap", h1_style))
    story.append(Paragraph(
        "<b>Deliberate Design Decisions:</b><br/>"
        "• <b>Primary Source Strictness:</b> Pull research is strictly bounded to Annual Reports, Concall Transcripts, and BSE filings. Broker notes and open-web hallucinations are disallowed by design to ensure 100% auditability.<br/>"
        "• <b>Next.js Serverless + GitHub Actions Cron:</b> Heavy batch scraping and PyMuPDF PDF chunking run on GitHub Actions cron schedules (13:00 UTC Mon-Fri), keeping the Vercel serverless deployment fast, lightweight, and resilient.<br/>"
        "• <b>Zero-Empty-Screen Offline Fallback:</b> Every endpoint serves from versioned local snapshots (`data/snapshots/`) when external exchange APIs or databases experience network timeouts.<br/>"
        "• <b>What Was Deliberately Left Out:</b> Multi-user auth and intraday tick streaming were omitted to preserve focus on high-signal corporate disclosures.<br/>"
        "• <b>Next Roadmap:</b> Automated morning briefs delivered via WhatsApp, user feedback loops to adjust priority weights based on swipe dismissals, and cross-portfolio capex tracking.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # Section 5: Repository & Submission Checklist
    story.append(Paragraph("5. Submission Verification & Links", h1_style))
    check_data = [
        [Paragraph("<b>Item</b>", table_header_style), Paragraph("<b>Status & Access Details</b>", table_header_style)],
        [
            Paragraph("Mobile Prototype", table_cell_style),
            Paragraph(f"<a href='{live_url}' color='#0D9488'>{live_url}</a> (Optimized for phone & desktop frame)", table_cell_style)
        ],
        [
            Paragraph("Architecture & Docs", table_cell_style),
            Paragraph("README.md (architecture diagram, local setup, model routing) + WRITEUP.md", table_cell_style)
        ],
        [
            Paragraph("Data Plumbing", table_cell_style),
            Paragraph("18 portfolio stocks + 4 watchlist companies; BSE API + yfinance + Screener.in", table_cell_style)
        ],
        [
            Paragraph("AI Build History", table_cell_style),
            Paragraph("Full transcript and step-by-step agent trajectory preserved in repository", table_cell_style)
        ]
    ]
    check_table = Table(check_data, colWidths=[130, 390])
    check_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(check_table)

    doc.build(story)
    print(f"Submission PDF successfully generated: {output_path}")

if __name__ == "__main__":
    generate_submission_pdf()
