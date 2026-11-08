# Library Management System - Book Catalog Data Layer

This repository implements the data layer for the library's book catalog using Prisma ORM with PostgreSQL and NestJS.

## Schema Decisions

### Why Book References Genre Rather Than Embedding It

In designing the catalog schema, `Book` references `Genre` via a foreign key (`genreId`) with a relation (`@relation`), rather than embedding genre information directly within the `Book` model. This design decision was made for the following reasons:

1. **Normalization and Data Integrity**: Storing genres in a dedicated `Genre` table eliminates data redundancy and prevents data anomalies. If genre names were embedded as raw strings or embedded objects across book records, typographical errors (e.g., "Sci-Fi", "SciFi", "Science Fiction") could easily fragment catalog categorization. With a dedicated entity and a unique constraint on `name`, each genre represents a single canonical source of truth.
2. **Atomic Updates and Maintainability**: If a genre needs to be renamed or categorized differently, updating a single row in the `Genre` table immediately reflects across all associated books. In an embedded design, updating a genre would require costly bulk updates across every corresponding book row.
3. **Database-Level Referential Integrity**: By establishing a foreign key constraint (`fields: [genreId], references: [id]`), PostgreSQL enforces relational integrity at the engine level. Books cannot reference non-existent genres, and deletions or cascades can be handled cleanly and deterministically.
4. **Independent Lifecycle and Query Performance**: Genres possess their own lifecycle independent of individual book records (e.g., pre-populating available library genres before books are cataloged). Furthermore, foreign key indexing allows efficient relational joins and filtering operations.
5. **Future Extensibility**: A separate `Genre` model can easily be expanded in the future with additional attributes—such as descriptions, parent/subgenre hierarchies, or classification codes—without bloating the `Book` model.

