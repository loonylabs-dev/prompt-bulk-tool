# Prompt Bulk Tool

Eine Webapp zur Bulk-Erstellung und automatisierten Ausführung von AI-Prompts.

## Überblick

Das Prompt Bulk Tool ermöglicht es:
- **Prompt-Templates** mit Platzhaltern (`{{variable_name}}`) zu erstellen
- **Variablen** zu definieren und zu verwalten  
- **Bulk-Prompts** durch Kombination von Templates und Variablen zu generieren
- **Browser-Automation** für die automatische Ausführung auf AI-Plattformen (ChatGPT, Claude, Gemini)

## Quick Start

### 1. Installation
```bash
# Dependencies installieren und Setup ausführen
npm run setup
```

### 2. Backend starten
```bash
# Entwicklungsmodus
npm run dev

# Oder nur Backend
npm run dev -w backend
```

### 3. API testen
```bash
# Health Check
curl http://localhost:3001/api/health
```

## Architektur

### Monorepo-Struktur
```
prompt-bulk-tool/
├── shared/          # Gemeinsame TypeScript Types
├── backend/         # Express.js API Server  
├── frontend/        # Next.js React Frontend (geplant)
└── automation/      # Playwright Browser-Automation (geplant)
```

### API Endpoints

#### Templates
- `GET /api/templates` - Alle Templates abrufen
- `POST /api/templates` - Neues Template erstellen
- `GET /api/templates/:id` - Template abrufen
- `PUT /api/templates/:id` - Template aktualisieren
- `DELETE /api/templates/:id` - Template löschen

#### Variablen
- `GET /api/variables` - Alle Variablen abrufen
- `POST /api/variables` - Neue Variable erstellen
- `GET /api/variables/sets` - Variable-Sets abrufen
- `POST /api/variables/sets` - Neues Variable-Set erstellen

#### Prompt-Generierung
- `POST /api/generation/generate` - Prompts generieren
- `GET /api/generation/prompts` - Generierte Prompts abrufen
- `GET /api/generation/export` - Prompts exportieren (JSON/CSV/TXT)

## Beispiel-Workflow

### 1. Template erstellen
```json
{
  "name": "Produktbeschreibung",
  "description": "Template für E-Commerce Produkttexte",
  "content": "Erstelle eine Produktbeschreibung für {{product_type}} in {{style}} Stil für die Zielgruppe {{target_audience}}",
  "category": "marketing",
  "tags": ["e-commerce", "copywriting"]
}
```

### 2. Variablen definieren
```json
{
  "name": "product_type",
  "type": "text", 
  "possibleValues": ["Smartphone", "Laptop", "Kopfhörer"]
}
```

### 3. Variable-Set erstellen
```json
{
  "name": "E-Commerce Mix",
  "variables": {
    "product_type": ["Smartphone", "Laptop"], 
    "style": ["modern", "klassisch"],
    "target_audience": ["junge Erwachsene", "Professionals"]
  }
}
```

### 4. Prompts generieren
Das System erstellt alle Kombinationen: 2×2×2 = 8 verschiedene Prompts.

## Entwicklung

### Befehle
```bash
# Alle Pakete bauen
npm run build

# Typ-Checking
npm run type-check

# Backend entwickeln
npm run dev -w backend

# Shared Types bauen (erforderlich vor anderen Paketen)
npm run build -w shared
```

### Datenbank
- SQLite wird automatisch unter `database/prompt-bulk-tool.db` erstellt
- Schema und Migrationen laufen beim Server-Start
- Umgebungsdatei: `.env` (siehe `.env.example`)

## Nächste Schritte

- [ ] Next.js Frontend implementieren
- [ ] Playwright Browser-Automation entwickeln
- [ ] UI für Template/Variable-Management
- [ ] Cookie-Management für persistente AI-Sessions
- [ ] Batch-Verarbeitung mit Progress-Tracking

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite
- **Frontend**: Next.js, React, TailwindCSS (geplant)
- **Automation**: Playwright (geplant)  
- **Database**: SQLite mit automatischen Migrationen