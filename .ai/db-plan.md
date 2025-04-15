# Schemat bazy danych

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### Tabela `users`
- `id` UUID PRIMARY KEY
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `encrypted_password`: VARCHAR NOT NULL
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `confirmed_at`: TIMESTAMPTZ
- To jest tabela zarządzana przez Supabase.

### Tabela `flashcards`
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
- `front` VARCHAR(200) NOT NULL
- `back` VARCHAR(500) NOT NULL
- `source` VARCHAR(20) NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

### Tabela `generations`
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
- `model` VARCHAR NOT NULL
- `generated_count` INTEGER NOT NULL
- `generated_unedited_count` INTEGER NULLABLE
- `accepted_edited_count` INTEGER NULLABLE
- `source_text_hash` VARCHAR NOT NULL
- `generation_duration` INTEGER NOT NULL 
- `source_text_lemgth` TEXT NOT NULL CHECK (char_length(source_text) BETWEEN 1000 AND 10000)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

### Tabela `generation_error_logs`
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
- `model` VARCHAR NOT NULL
- `source_text_hash` VARCHAR NOT NULL
- `source_text_length` INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- `error_code` VARCHAR(100) NOT NULL
- `error_message` TEXT NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

## 2. Relacje między tabelami
- Relacja 1:n: Jeden użytkownik (`users`) może posiadać wiele rekordów w tabelach `flashcards`, `generations` oraz `generation_error_logs`.
- Klucze obce na kolumnie `user_id` zapewniają integralność danych i są ustawione z mechanizmem `ON DELETE RESTRICT`.

## 3. Indeksy
- Klucze główne automatycznie tworzą indeksy.
- Kolumna `user_id` posiada indeks, co optymalizuje zapytania związane z relacjami.
- Dodatkowe indeksy mogą być dodane w zależności od potrzeb wydajnościowych.

## 4. Zasady PostgreSQL (RLS)
- Dla tabel posiadających kolumnę `user_id` należy wdrożyć politykę RLS ograniczającą dostęp tylko do danych będących własnością danego użytkownika.
- Przykładowa polityka:

  ```sql
  CREATE POLICY user_rls_policy ON flashcards
      FOR ALL
      USING (user_id = auth.uid());
  ```

- Analogicznie wdrożyć polityki dla tabel `generations` i `generation_error_logs`.

## 5. Dodatkowe uwagi
- Schemat jest znormalizowany do 3NF i zaprojektowany zgodnie z najlepszymi praktykami.
- Uwzględniono ograniczenia długości pól i check constraints zgodnie z wymaganiami projektu.
- Schemat został zaprojektowany z myślą o przyszłym rozszerzeniu, np. o encję `learning_sessions`. 