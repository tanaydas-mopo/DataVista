# DataVista Documentation Suite

Welcome to the official technical documentation, architecture specifications, and design system repository for **DataVista**.

---

## Documentation Index

| Document | Description | Format / Version |
|---|---|---|
| [**PRD.md**](./PRD.md) | **Product Requirements Document**: Comprehensive breakdown of vision, personas, 31 core functional requirements (`FR-INGEST-*` to `FR-AUTH-*`), roadmap, and traceability matrix. | Markdown (v1.0.0) |
| [**SRS.md**](./SRS.md) | **Software Requirements Specification**: Detailed architectural design, Mermaid system diagrams, 11 screen specifications, data pipeline, and non-functional requirements. | Markdown (v1.0.0) |
| [**design.md**](./design.md) | **Design System & UI Specification**: 50-section single source of truth for visual tokens, 4 theme palettes, typography scale, component specs, asset catalog, and QA checklists. | Markdown (v1.0.0) |

---

## Directory Organization

```text
documentation/
├── PRD.md             # Product requirements, features & roadmap
├── SRS.md             # Software architecture, data model & screen specs
├── design.md          # Visual tokens, component variants & theme rules
└── README.md          # This documentation portal index
``

For engineering instructions on local development, see the root [`README.md`](../README.md).
For database schema migrations and Edge Functions, see [`supabase/README.md`](../supabase/README.md).
