#!/usr/bin/env python3
"""Build Diego Gaxiola's CV as a Letter-size PDF using reportlab.

Faithful to the original 'CV Diego Gaxiola English 2026.pdf', with the
current role updated from the diego-portfolio website:
  - Agentcy (Jan 2025 – Current) — current role per portfolio.
  - EPAM / BBVA (May 2025 – Jan 2026) — past role, corrected dates.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem,
    HRFlowable,
)

OUT = "/home/dgs/Documents/projects/diego_portfolio/CV Diego Gaxiola English 2026.pdf"

styles = getSampleStyleSheet()
BODY = ParagraphStyle("body", parent=styles["Normal"], fontName="Helvetica",
                      fontSize=10.5, leading=14, spaceAfter=2)
BULLET = ParagraphStyle("bullet", parent=BODY, leftIndent=14, bulletIndent=4,
                        spaceAfter=1)
TITLE = ParagraphStyle("title", parent=styles["Title"], fontName="Helvetica-Bold",
                       fontSize=20, leading=22, spaceAfter=1, alignment=TA_CENTER)
CONTACT = ParagraphStyle("contact", parent=BODY, alignment=TA_CENTER,
                         fontSize=10.5, spaceAfter=8)
H2 = ParagraphStyle("h2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                    fontSize=12, leading=14, spaceBefore=10, spaceAfter=3)
JOB_TITLE = ParagraphStyle("jobtitle", parent=BODY, fontName="Helvetica-Bold",
                           fontSize=11, spaceAfter=1)
JOB_META = ParagraphStyle("jobmeta", parent=BODY, fontSize=10, spaceAfter=2)
LABEL = ParagraphStyle("label", parent=BODY, fontName="Helvetica-Bold",
                       spaceBefore=3, spaceAfter=1)


def bullets(items, style=BULLET):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=14, value="•") for t in items],
        bulletType="bullet", start="•", leftIndent=14,
    )


def job(title, company, dates, project, description, activities, responsibilities):
    flow = [
        Paragraph(f'{title} <font color="#444444">— {company}</font>', JOB_TITLE),
        Paragraph(f'<b>{dates}</b>', JOB_META),
    ]
    if project:
        flow.append(Paragraph("<b>Project:</b>", LABEL))
        flow.append(bullets(project))
    if description:
        flow.append(Paragraph("Description:", LABEL))
        flow.append(Paragraph(description, BODY))
    if activities:
        flow.append(Paragraph("Activities:", LABEL))
        flow.append(bullets(activities))
    if responsibilities:
        flow.append(Paragraph("Responsibilities:", LABEL))
        flow.append(bullets(responsibilities))
    flow.append(Spacer(1, 6))
    return flow


story = []

# Header
story.append(Paragraph("Diego Gaxiola Sánchez", TITLE))
story.append(Paragraph("Diego.gaxi@hotmail.com &nbsp;|&nbsp; +52 6674181199", CONTACT))
story.append(HRFlowable(width="100%", thickness=1, color="#1a1a1a", spaceAfter=6))

# Summary
story.append(Paragraph("Summary", H2))
story.append(bullets([
    "Software Engineer applying the best and most effective solutions on enterprise scale.",
    "Full Stack Developer specialized in creating business solutions for web applications, utilizing frameworks such as Angular and Ruby on Rails, as well as developing APIs and integrating databases.",
]))

# Objective
story.append(Paragraph("Objective", H2))
story.append(bullets([
    "My goal is to continuously learn and apply new technologies, expand my knowledge and experience in the professional field, and share my expertise to contribute to the development of new technologies and innovative projects.",
]))

# Interpersonal Skills
story.append(Paragraph("Interpersonal Skills", H2))
story.append(bullets([
    "Decision Making, Responsible, Honest, Respectful, Teamwork, Fair, Supportive, Ownership, Friendly, Quick Learning, Work under pressure, Self-taught, I investigate until I find a solution.",
]))

# Specific Skills
story.append(Paragraph("Specific Skills", H2))
story.append(bullets([
    "<b>Programming Languages:</b> Ruby, JavaScript, Typescript, Java, PHP.",
    "<b>Other:</b> HTML5, SCSS.",
    "<b>Methodologies:</b> Custom Combination approach of SCRUM + XP.",
    "<b>Database managers:</b> MySQL, PostgreSQL, MongoDB, Redis.",
    "<b>Cloud Services:</b> AWS Lambda, Google Cloud Functions.",
    "<b>Libraries/Gems/FrameWorks:</b> Ruby on Rails, Java, Laravel, Angular, NextJs, Bootstrap, Rspec, Hotwire-rails, Stimulus, Devise, Pundit, Audited, Pagy, Redis, Sidekiq, OpenAi, Nokogiri, Factory_bot_rails, Webpacker, ActiveStorage.",
    "<b>Tools:</b> Git, Trello, SourceTree, GitLab, Xampp, Ubuntu Server, NGINX, Node, Postman, Chrome DevTools, Visual Studio Code.",
]))

# Education
story.append(Paragraph("Education", H2))
story.append(bullets([
    "<b>TECNM Campus Culiacán</b> – Computational Systems Engineering &nbsp;&nbsp; Sinaloa, México &nbsp; 2015 – 2020",
]))

# Experience
story.append(Paragraph("Experience", H2))

# Agentcy (current) — from portfolio website
story += job(
    "Founding Engineer / AI Systems Lead", "Agentcy", "Jan 2025 – Current",
    ["AgentChain — multi-agent orchestration platform for autonomous software development (SDLC)."],
    "Designed and built AgentChain, a platform that coordinates multiple AI agents to plan, execute and verify engineering workflows with adversarial verification between agents.",
    [
        "Architected concurrent, multi-agent workflows orchestrated from the terminal.",
        "Implemented adversarial verification passes between agents to validate results.",
        "Developed the backend runtime and data layer (Bun, TypeScript, PostgreSQL) integrated with the Claude API.",
        "Owned the product end-to-end: design, build, and production deployment.",
    ],
    [
        "Take ownership of the project and deliver high-quality work on time.",
        "Lead the architecture and technical direction of the platform.",
        "Define technical solutions and translate requirements into actionable tasks.",
        "Deliver solutions following the best development quality practices.",
    ],
)

# EPAM / BBVA — from portfolio website (corrected dates)
story += job(
    "Software Engineer", "EPAM / BBVA", "May 2025 – Jan 2026",
    ["Digital core banking — mobile payments squad."],
    None,
    [
        "Contributed to BBVA's digital core banking in the mobile payments squad.",
        "Participated in the migration from monolith to microservices architecture.",
        "Developed business logic in back-end (Java, Spring) and front-end (Angular).",
        "Database administration and analysis (Oracle); CI/CD with Jenkins.",
    ],
    [
        "Deliver high-quality solutions with the best development quality practices.",
        "Correctly define time estimates of project tasks.",
        "Effective communication with the squad and stakeholders.",
    ],
)

# Neoris
story += job(
    "Full Stack Developer", "Neoris", "Sep 2024 – May 2025",
    ["Administrative Legal System"],
    None,
    [
        "Analysis of requirements.",
        "Planning the technical resolution of the problem.",
        "Development of views and functionalities in front-end technologies (Angular 17, TypeScript).",
        "Development of business logic (REST API - Microservices) back end (Java Springboot).",
        "Database administration and analysis (PostgreSQL).",
        "Implementation of technologies to production.",
    ],
    [
        "Development of customized solutions using technologies for front end and back end.",
        "User Stories Technical Analysis.",
        "Directed the process of analysis, development and production of the content of the page to meet the demands of the project and customer needs.",
        "Gathered, defined, and transformed customer requirements into actionable tasks and user stories.",
    ],
)

# Corporativo Caprepa
story += job(
    "Full Stack Developer", "Corporativo Caprepa", "July 2024 – Sep 2024",
    ["Business Administration and Financial Management System"],
    None,
    [
        "Planning solutions for a necessity.",
        "Develop API´s for different projects and necessities.",
        "Implement database schemas and migrations (MySQL).",
        "Code refactoring to improve maintenance.",
        "Development of business logic (REST API - Microservices) back end (PHP Lavarel).",
        "Development of views and functionalities in front-end technologies (Angular 17, TypeScript).",
    ],
    [
        "Deliver high-quality work.",
        "Deliver solutions with the best development quality practices.",
        "Correctly define time estimates of project tasks.",
        "Innovation and creativity in solutions.",
        "Develop UI components.",
    ],
)

# Fuentebuena
story += job(
    "Full Stack Developer", "Fuentebuena", "May 2022 – May 2024",
    ["Vehicle Leasing, development and maintenance of ERP and CRM systems."],
    None,
    [
        "Generation of reports with Cloud Functions and Lambda Functions and sending the data to an API.",
        "Planning solutions for a necessity.",
        "Develop Front-End (JS) and Back-End (Ruby on Rails and PHP Lavarel) code such as Views, Models, Controllers, Services, Helpers, Workers, Testings.",
        "Develop API´s for different projects and necessities.",
        "Implement database schemas and migrations (Postgres, MySQL, MongoDB).",
        "Code refactoring to improve maintenance.",
        "Provide guidance to members.",
    ],
    [
        "Take ownership on project and deliver high-quality work on time.",
        "Effective communication.",
        "Deliver solutions with the best development quality practices.",
        "Correctly define time estimates of project tasks.",
    ],
)

# Santa Maria de la Luz
story += job(
    "Full Stack Developer", "Santa Maria de la Luz Jardin Funerario S.A de C.V", "June 2019 – May 2022",
    ["Web information system for accounting administration, information on employees and customer management, such as account statements, suppliers, loans, payroll, bills receivable, amortizations, inventories, billing map with geolocation."],
    None,
    [
        "Survey of requirements, Analysis and planning the resolution of the problem.",
        "Development of views and functionalities in front-end technologies (React Js, Angular Js).",
        "Development of business logic in a REST API in back-end (Ruby On Rails).",
        "Database administration and analysis (MySQL).",
    ],
    [
        "Development of customized solutions for the company problems using technologies for front end and back end such as AngularJs, ReactJs, Ruby, Ruby on Rails, and in the database, MySQL.",
        "Directed the process of analysis, design, development and production of the content of the page to meet the demands of the project and customer needs.",
        "Gathered, defined, and transformed customer requirements into actionable tasks and user stories.",
        "Automated the accounting process of the company creating tables to store information and obtain reports on suppliers, accounts receivable, inventories, amortizations, credits, loans, balance sheet.",
    ],
)

doc = SimpleDocTemplate(
    OUT, pagesize=letter,
    leftMargin=1 * inch, rightMargin=1 * inch,
    topMargin=0.8 * inch, bottomMargin=0.8 * inch,
    title="Diego Gaxiola Sánchez — CV",
    author="Diego Gaxiola Sánchez",
)
doc.build(story)
print("PDF written to:", OUT)
