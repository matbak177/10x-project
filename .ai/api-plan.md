# REST API Plan

This document outlines the design for the REST API of the 10xCards application.

## 1. Resources

- **Users**
  - _Database Table_: `users`
  - Managed through Supabase Auth; operations such as registration and login may be handled via Supabase or custom endpoint if needed

- **Flashcards**
  - _Database Table_: `flashcards`
  - Fields include: `id`, `front`, `back`, `source`, `created_at`, `updated_at`, `generation_id`, `user_id`.

- **Users**
  - _Database Table_: `generations`
  - Stores metadata and results of AI generation requests (e.g. `model`, `generated_count`, `source_text_hash`, `source_text_length`, `generation_duration`)

- **Users**
  - _Database Table_: `generation_error_logs`
  - Used for logging errors encountered during AI flashcard generation.

## 2. Endpoints

### 2.1. Flashcards

#### **List Flashcards**

- **Method**: `GET`
- **Path**: `/flashcards`
- **Description**: Retrieves a paginated and sorted list of the user's flashcards.
- **Query Parameters**:
  - `page` (optional, number, default: 1): The page number for pagination.
  - `limit` (optional, number, default: 20): The limit of items.
  - `sort` (optional, string, default: 'created_at'): The field to sort by (e.g., `created_at`, `updated_at`, `front`).
  - `order` (optional, string, default: 'desc'): The sort order (`asc` or `desc`).
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "front": "What is REST?",
          "back": "Representational State Transfer is an architectural style for...",
          "source": "manual",
          "created_at": "2025-11-11T15:10:00Z",
          "updated_at": "2025-11-11T15:10:00Z",
          "generation_id": null
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1
      }
    }
    ```
- **Error Response**:
  - **Code**: `401 Unauthorized`

---

#### **Get a Single Flashcard**

- **Method**: `GET`
- **Path**: `/flashcards/{id}`
- **Description**: Retrieves a specific flashcard by its ID.
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**:
    ```json
    {
      "id": 1,
      "front": "What is REST?",
      "back": "Representational State Transfer is an architectural style for...",
      "source": "manual",
      "created_at": "2025-11-11T15:10:00Z",
      "updated_at": "2025-11-11T15:10:00Z",
      "generation_id": null
    }
    ```
- **Error Responses**:
  - **Code**: `401 Unauthorized`
  - **Code**: `404 Not Found`

---

#### **Create Flashcards**

- **Method**: `POST`
- **Path**: `/flashcards`
- **Description**: Creates single or multiple flashcards (manually or from AI generation)
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front": "Card 1 Front",
        "back": "Card 1 Back",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "Card 2 Front",
        "back": "Card 2 Back",
        "source": "ai-full",
        "generation_id": 123
      }
    ]
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Body**: An array of the newly created flashcard objects.
- **Error Responses**:
  - **Code**: `400 Bad Request` (Validation error)
  - **Code**: `401 Unauthorized`

---

#### **Update a Flashcard**

- **Method**: `PUT`
- **Path**: `/flashcards/{id}`
- **Description**: Edit an existing flashcard.
- **Success Response**:
  - **Code**: `204 No Content`
- **Error Responses**:
  - **Code**: `401 Unauthorized`
  - **Code**: `404 Not Found`
- **Validations**:
  - `front` maxim length: 200 charactes
  - `back` maxim length: 500 charactes
  - `source`Must be one of `ai-edited` or `manual`

---

#### **Delete a Flashcard**

- **Method**: `DELETE`
- **Path**: `/flashcards/{id}`
- **Description**: Deletes a flashcard by its ID.
- **Success Response**:
  - **Code**: `204 No Content`
- **Error Responses**:
  - **Code**: `401 Unauthorized`
  - **Code**: `404 Not Found`

---

### 2.2. Generations

- **Method**: `POST`
- **Path**: `/generations`
- **Description**: Initiate the AI generation process for flashcards proposals based on user-provided text.
- **Request Body**:
  ```json
  {
    "source_text": "A long block of text about a specific topic, between 1000 and 10000 characters..."
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**:
    ```json
    {
      "flashcards_proposals": [
        {
          "id":1,
          "front": "Suggested question 1?",
          "back": "Suggested answer 1.",
          "source": "ai-full"
        },
        {
          "id":2,
          "front": "Suggested question 2?",
          "back": "Suggested answer 2."
          "source": "ai-full"
        }
      ],
      "generation_id":123,
      "generated_count":5
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Validation error, e.g., text too short/long).
  - **Code**: `401 Unauthorized`
  - **Code**: `502 Bad Gateway` (Error from the external AI service). A `generation_error_logs` record is created.

#### **List Generations**

- **Method**: `GET`
- **Path**: `/generations`
- **Description**: Retrieves a list of generations requests for the authenticated users.
- **Query Parameters**:
  - `page` (optional, number, default: 1): The page number for pagination.
  - `limit` (optional, number, default: 20): The limit of items per page.
  - `sort` (optional, string, default: 'created_at'): The field to sort by (e.g., `created_at`, `model`).
  - `order` (optional, string, default: 'desc'): The sort order (`asc` or `desc`).
- **Response JSON**: List of generation obejct with metadata

---

#### **Get a Single Generation**

- **Method**: `GET`
- **Path**: `/generations/{id}`
- **Description**: Retrieves a specific generation record by its ID.
- **Response JSON**: Geenration details and associated flashcards.
- **Errors**: 404 Not Found.

---

## 3. Authentication and Authorization

- **Authentication**: The API will use JWT-based authentication provided by Supabase. Clients must include a valid JWT in the `Authorization` header with the `Bearer` scheme on every request to a protected endpoint.
  ```
  Authorization: Bearer <SUPABASE_JWT>
  ```
- **Authorization**: Authorization is enforced at the database level using PostgreSQL's Row-Level Security (RLS). All policies ensure that users can only access and manipulate their own data (`user_id = auth.uid()`). The API backend executes all database queries in the context of the authenticated user.

## 4. Validation and Business Logic

### 4.1. Validation Rules

The following validation rules, derived from the database schema and PRD, will be enforced by the API for all create and update operations on flashcards.

- **Flashcards**:
  - `front`: Required, string, max 200 characters.
  - `back`: Required, string, max 500 characters.
  - `source`: Required, string, must be one of `'ai-full'`, `'ai-edited'`, or `'manual'`.

- **Generations**:
  - `source_text`: Required, string, min 1000 and max 10000 characters.
  - `source_text_hash`: Computed for duplicate detection.

### 4.2. Business Logic Implementation

- **AI Generation Flow**:
  1.  The client sends a `POST` request to `/generations` with the source text.
  2.  The API validates the text length, calls the external AI service, and logs errors to `generation_error_logs` if necessary.
  3.  The API returns a list of flashcard candidates and generation metadata to the client.
  4.  The client displays the candidates for review (accept, edit, discard).
  5.  Once the user confirms their selection, the client sends a `POST` request to `/flashcards` with the final list of flashcards to be created and the generation metadata.
  6.  The batch endpoint creates a new record in the `generations` table and then creates all the associated `flashcards` records in a single database transaction, linking them via the new `generation_id`.
- **Manual Creation**: A simple `POST` to `/flashcards` is used for manual flashcard creation.
- **Rate Limiting**: The `POST /generations` endpoint will be rate-limited to prevent abuse and control costs associated with the external AI service. A reasonable limit would be 10 requests per user per minute.
