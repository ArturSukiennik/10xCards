# REST API Plan

## 1. Resources

- **Users**: Maps to `users` table for authentication and user management
- **Flashcards**: Maps to `flashcards` table for managing individual flashcards
- **Generations**: Maps to `generations` table for tracking AI generation sessions
- **Generation Errors**: Maps to `generation_error_logs` table for tracking errors during generation

## 2. Endpoints

### Flashcards Endpoints

#### List Flashcards

- Method: GET
- Path: `/flashcards`
- Description: Get flashcards for the authenticated user
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 20)
  - `sort_by`: Field to sort by (default: 'created_at')
  - `order`: 'asc' or 'desc' (default: 'desc')
  - `source`: Filter by source ('ai-full', 'ai-edited', 'manual')
- Response Payload:
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "What is REST?",
        "back": "REST is an architectural style for APIs...",
        "source": "ai-full",
        "created_at": "2023-06-15T10:00:00Z",
        "updated_at": "2023-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "limit": 20
    }
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized (Not logged in)

#### Get Flashcard

- Method: GET
- Path: `/flashcards/{id}`
- Description: Get a specific flashcard
- Response Payload:
  ```json
  {
    "id": 1,
    "front": "What is REST?",
    "back": "REST is an architectural style for APIs...",
    "source": "ai-full",
    "created_at": "2023-06-15T10:00:00Z",
    "updated_at": "2023-06-15T10:00:00Z"
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized (Not logged in)
  - 403 Forbidden (Not owner of the flashcard)
  - 404 Not Found (Flashcard not found)

#### Create Flashcard (Manual)

- Method: POST
- Path: `/flashcards`
- Description: Create a new flashcard manually
- Request Payload:
  ```json
  {
    "front": "What is REST?",
    "back": "REST is an architectural style for APIs..."
  }
  ```
- Response Payload:
  ```json
  {
    "id": 1,
    "front": "What is REST?",
    "back": "REST is an architectural style for APIs...",
    "source": "manual",
    "created_at": "2023-06-15T10:00:00Z",
    "updated_at": "2023-06-15T10:00:00Z"
  }
  ```
- Success: 201 Created
- Errors:
  - 400 Bad Request (Invalid data)
  - 401 Unauthorized (Not logged in)

#### Create Multiple Flashcards

- Method: POST
- Path: `/flashcards/batch`
- Description: Create multiple flashcards at once (supports manual creation and AI-generated flashcards)
- Request Payload:
  ```json
  {
    "flashcards": [
      {
        "front": "What is REST?",
        "back": "REST is an architectural style for APIs...",
        "source": "manual"
      },
      {
        "front": "What is an API?",
        "back": "Application Programming Interface...",
        "source": "ai-full"
      },
      {
        "front": "What is JSON?",
        "back": "JavaScript Object Notation...",
        "source": "ai-edited"
      }
    ],
    "generation_id": 123 // Optional, required only for AI-generated flashcards
  }
  ```
- Response Payload:
  ```json
  {
    "created_count": 3,
    "flashcards": [
      {
        "id": 101,
        "front": "What is REST?",
        "back": "REST is an architectural style for APIs...",
        "source": "manual",
        "created_at": "2023-06-15T10:00:00Z",
        "updated_at": "2023-06-15T10:00:00Z"
      },
      {
        "id": 102,
        "front": "What is an API?",
        "back": "Application Programming Interface...",
        "source": "ai-full",
        "created_at": "2023-06-15T10:00:00Z",
        "updated_at": "2023-06-15T10:00:00Z"
      },
      {
        "id": 103,
        "front": "What is JSON?",
        "back": "JavaScript Object Notation...",
        "source": "ai-edited",
        "created_at": "2023-06-15T10:00:00Z",
        "updated_at": "2023-06-15T10:00:00Z"
      }
    ]
  }
  ```
- Success: 201 Created
- Errors:
  - 400 Bad Request (Invalid data)
  - 401 Unauthorized (Not logged in)
  - 404 Not Found (Generation not found, if generation_id is provided)

#### Update Flashcard

- Method: PUT
- Path: `/flashcards/{id}`
- Description: Update an existing flashcard
- Request Payload:
  ```json
  {
    "front": "Updated front",
    "back": "Updated back"
  }
  ```
- Response Payload:
  ```json
  {
    "id": 1,
    "front": "Updated front",
    "back": "Updated back",
    "source": "manual",
    "created_at": "2023-06-15T10:00:00Z",
    "updated_at": "2023-06-15T11:00:00Z"
  }
  ```
- Success: 200 OK
- Errors:
  - 400 Bad Request (Invalid data)
  - 401 Unauthorized (Not logged in)
  - 403 Forbidden (Not owner of the flashcard)
  - 404 Not Found (Flashcard not found)

#### Delete Flashcard

- Method: DELETE
- Path: `/flashcards/{id}`
- Description: Delete a flashcard
- Response Payload:
  ```json
  {
    "message": "Flashcard successfully deleted"
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized (Not logged in)
  - 403 Forbidden (Not owner of the flashcard)
  - 404 Not Found (Flashcard not found)

### Generation Endpoints

#### Generate Flashcards

- Method: POST
- Path: `/generations`
- Description: Generate flashcards from text using LLM
- Request Payload:
  ```json
  {
    "source_text": "Lorem ipsum dolor sit amet...",
    "model": "gpt-4"
  }
  ```
- Response Payload:
  ```json
  {
    "generation_id": 123,
    "generated_flashcards": [
      {
        "id": "temp_1",
        "front": "What is Lorem Ipsum?",
        "back": "Lorem Ipsum is simply dummy text..."
      },
      {
        "id": "temp_2",
        "front": "Where does Lorem Ipsum come from?",
        "back": "Lorem Ipsum comes from sections..."
      }
    ]
  }
  ```
- Success: 200 OK
- Errors:
  - 400 Bad Request (Invalid source text or model)
  - 401 Unauthorized (Not logged in)
  - 502 Bad Gateway (AI service unavailable)

#### Save Generated Flashcards

- Method: POST
- Path: `/generations/{generation_id}/save`
- Description: Save accepted/edited flashcards from a generation
- Request Payload:
  ```json
  {
    "flashcards": [
      {
        "temp_id": "temp_1",
        "front": "What is Lorem Ipsum?",
        "back": "Lorem Ipsum is simply dummy text...",
        "source": "ai-full"
      },
      {
        "temp_id": "temp_2",
        "front": "Modified front content",
        "back": "Modified back content",
        "source": "ai-edited"
      }
    ]
  }
  ```
- Response Payload:
  ```json
  {
    "saved_count": 2,
    "flashcards": [
      {
        "id": 101,
        "front": "What is Lorem Ipsum?",
        "back": "Lorem Ipsum is simply dummy text...",
        "source": "ai-full"
      },
      {
        "id": 102,
        "front": "Modified front content",
        "back": "Modified back content",
        "source": "ai-edited"
      }
    ]
  }
  ```
- Success: 201 Created
- Errors:
  - 400 Bad Request (Invalid flashcards data)
  - 401 Unauthorized (Not logged in)
  - 404 Not Found (Generation not found)

#### Get Generation Statistics

- Method: GET
- Path: `/generations/stats`
- Description: Get statistics about flashcards generation for current user
- Query Parameters:
  - `period`: 'day', 'week', 'month', 'all' (default: 'month')
- Response Payload:
  ```json
  {
    "total_generations": 25,
    "total_flashcards_generated": 250,
    "flashcards_accepted": 200,
    "acceptance_rate": 80,
    "by_source": {
      "ai_full": 150,
      "ai_edited": 50,
      "manual": 25
    }
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized (Not logged in)

## 3. Authentication and Authorization

The API will use Supabase authentication:

- JWT tokens for authentication
- Row Level Security (RLS) policies in PostgreSQL to enforce user-based access control
- Each request must include the authorization bearer token in the header:
  ```
  Authorization: Bearer <jwt_token>
  ```
- All endpoints except for register and login require authentication
- RLS policies will ensure users can only access their own data

## 4. Validation and Business Logic

### User Validation

- Email must be valid format
- Password must be at least 8 characters

### Flashcard Validation

- `front` field must be between 1 and 200 characters
- `back` field must be between 1 and 500 characters
- `source` must be one of: 'ai-full', 'ai-edited', 'manual'

### Generation Validation

- `source_text` must be between 1,000 and 10,000 characters
- `model` must be a valid model identifier

### Business Logic Implementation

- The API will enforce all database constraints defined in the schema
- Source text will be hashed for efficient storage and duplicate detection
- AI-generated flashcards will be presented to the user for review before saving
- When a user deletes their account, all associated data (flashcards, generations, logs) will be deleted
- Error logging will capture issues during AI generation for monitoring and improvement
