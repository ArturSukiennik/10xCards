# Specyfikacja techniczna integracji autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1 Nowe komponenty React (src/components/auth)

#### AuthForm.tsx

- Współdzielony komponent formularza dla logowania i rejestracji
- Obsługa walidacji pól email i hasła
- Integracja z Shadcn/ui dla spójnego wyglądu
- Obsługa różnych stanów (loading, error, success)
- Brak integracji z zewnętrznymi dostawcami autoryzacji (Google, GitHub, etc.)

#### LoginForm.tsx

- Rozszerza AuthForm o logikę logowania
- Integracja z Supabase Auth (tylko email/password)
- Przekierowanie po udanym logowaniu do /dashboard
- Obsługa błędów logowania

#### RegisterForm.tsx

- Rozszerza AuthForm o logikę rejestracji
- Dodatkowe pole potwierdzenia hasła
- Integracja z Supabase Auth (tylko email/password)
- Przekierowanie po udanej rejestracji do /dashboard
- Obsługa błędów rejestracji

#### LogoutButton.tsx

- Przycisk wylogowania w prawym górnym rogu layoutu
- Integracja z Supabase Auth
- Przekierowanie po wylogowaniu do strony logowania

### 1.2 Nowe strony Astro (src/pages)

#### login.astro

- Strona logowania
- Server-side rendering
- Przekierowanie zalogowanych użytkowników do /dashboard
- Integracja LoginForm

#### register.astro

- Strona rejestracji
- Server-side rendering
- Przekierowanie zalogowanych użytkowników do /dashboard
- Integracja RegisterForm

#### reset-password.astro

- Strona resetowania hasła
- Obsługa tokenów resetowania z URL
- Integracja PasswordResetForm

### 1.3 Modyfikacje istniejących komponentów

#### Layout.astro

- Dodanie LogoutButton dla zalogowanych użytkowników
- Warunkowe renderowanie elementów nawigacji
- Obsługa stanu autentykacji

### 1.4 Walidacja i komunikaty błędów

#### Walidacja client-side

- Email: format, wymagane pole
- Hasło: min. 8 znaków, wymagane pole
- Potwierdzenie hasła: zgodność z hasłem

#### Komunikaty błędów

- Nieprawidłowe dane logowania
- Błąd rejestracji (np. email już istnieje)
- Błąd resetowania hasła
- Problemy z połączeniem z Supabase

## 2. Logika backendowa

### 2.1 Endpointy API (src/pages/api)

#### auth/session.ts

- GET: Sprawdzenie stanu sesji
- DELETE: Wylogowanie użytkownika

#### auth/register.ts

- POST: Rejestracja nowego użytkownika
- Walidacja danych wejściowych
- Utworzenie konta w Supabase Auth (tylko email/password)

#### auth/login.ts

- POST: Logowanie użytkownika
- Walidacja danych wejściowych
- Utworzenie sesji
- Brak obsługi zewnętrznych providerów auth

#### auth/reset-password.ts

- POST: Inicjacja procesu resetowania hasła
- PUT: Aktualizacja hasła z tokenem

### 2.2 Middleware (src/middleware)

#### authMiddleware.ts

- Weryfikacja sesji użytkownika
- Przekierowania dla chronionych ścieżek
- Obsługa tokenów sesji

### 2.3 Serwisy (src/lib)

#### authService.ts

- Inicjalizacja klienta Supabase Auth
- Metody pomocnicze dla operacji autentykacji
- Obsługa tokenów i sesji

#### validationService.ts

- Walidacja danych wejściowych
- Generowanie komunikatów błędów
- Sanityzacja danych

### 2.4 Typy (src/types.ts)

```typescript
interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  password_confirmation: string;
}

interface PasswordResetCredentials {
  email: string;
}

interface NewPasswordCredentials {
  password: string;
  token: string;
}
```

## 3. System autentykacji

### 3.1 Konfiguracja Supabase Auth

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Konfiguracja klienta Supabase z wyłączeniem zewnętrznych providerów
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### 3.2 Integracja z Astro

#### Middleware

- Weryfikacja sesji na chronionych ścieżkach
- Przekierowania dla niezalogowanych użytkowników
- Obsługa wygasłych sesji

#### Server-side rendering

- Sprawdzanie stanu autentykacji przed renderowaniem
- Warunkowe renderowanie komponentów
- Obsługa SEO dla stron auth

### 3.3 Bezpieczeństwo

#### Ochrona danych

- Szyfrowanie haseł (handled by Supabase)
- Bezpieczne przechowywanie tokenów
- Walidacja CSRF

#### Rate limiting

- Ograniczenie prób logowania
- Ograniczenie prób resetowania hasła
- Ochrona przed atakami brute-force

### 3.4 Obsługa błędów

#### Typy błędów

- AuthenticationError
- ValidationError
- NetworkError
- ServerError

#### Logowanie błędów

- Szczegółowe logi dla debugowania
- Monitoring błędów autentykacji
- Alerty dla podejrzanych aktywności

## 4. Wdrożenie

### 4.1 Zmienne środowiskowe

```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
```

### 4.2 Migracje bazy danych

- Automatyczne migracje Supabase
- Backup danych użytkowników
- Plan rollback

### 4.3 Testy

- Unit testy dla komponentów auth
- Testy integracyjne flow autentykacji
- Testy bezpieczeństwa
- Testy wydajności

### 4.4 Monitoring

- Logowanie aktywności użytkowników
- Monitorowanie prób nieudanego logowania
- Alerty bezpieczeństwa
