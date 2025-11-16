# AI Flashcard Generator

![Project Banner](https://placehold.co/1200x600/000000/FFFFFF/png?text=AI+Flashcard+Generator)

A web application designed to streamline the learning process by automating the creation of educational flashcards using Large Language Models (LLMs). This tool helps students and professionals save time by generating high-quality flashcards from user-provided text.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope (MVP)](#project-scope-mvp)
- [Project Status](#project-status)
- [License](#license)

## Project Description

The AI Flashcard Generator addresses the time-consuming challenge of manually creating study materials. Users can paste text into the application, and our AI-powered backend will analyze it to suggest relevant question-and-answer pairs for flashcards. Users retain full control, with the ability to review, edit, accept, or reject AI suggestions before saving them into organized decks. The application also supports full manual creation and management of flashcards.

## Tech Stack

The project is built with a modern, type-safe, and efficient technology stack:

| Category            | Technology                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**        | [Astro 5](https://astro.build/), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/)  |
| **Backend**         | [Supabase](https://supabase.com/) (PostgreSQL, Authentication, BaaS)                                                                                                                               |
| **AI Integration**  | [Openrouter.ai](https://openrouter.ai/) (Access to various LLMs)                                                                                                                                   |
| **Testing**         | [Vitest](https://vitest.dev/) (Unit/Integration), [Playwright](https://playwright.dev/) (E2E), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (Components) |
| **CI/CD & Hosting** | [GitHub Actions](https://github.com/features/actions), [DigitalOcean](https://www.digitalocean.com/) (via Docker)                                                                                  |

## Getting Started Locally

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- **Node.js**: `v22.14.0` is required. We recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm).
  ```sh
  nvm use
  ```
- **npm** (or your preferred package manager like `pnpm` or `yarn`)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/ai-flashcard-generator.git
    cd ai-flashcard-generator
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the project root by copying the example file:

    ```sh
    cp .env.example .env
    ```

    Populate the `.env` file with your credentials for Supabase and Openrouter.ai.

    ```env
    # Supabase
    PUBLIC_SUPABASE_URL="your-supabase-url"
    PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

    # Openrouter.ai
    OPENROUTER_API_KEY="your-openrouter-api-key"
    ```

### Running the Application

Once the installation is complete, you can start the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:4321`.

## Available Scripts

This project includes several scripts to help with development:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Serves the production build locally for previewing.
- `npm run lint`: Lints the codebase for errors.
- `npm run lint:fix`: Lints the codebase and automatically fixes issues.
- `npm run format`: Formats all files using Prettier.

## Project Scope (MVP)

### In Scope

- **User Account System**: Secure registration and login via email and password.
- **AI-Powered Generation**: Create flashcards from pasted text (1,000-10,000 characters).
- **Review Workflow**: A dedicated interface to accept, edit, or reject AI-generated flashcards.
- **Manual Management**: Full CRUD (Create, Read, Update, Delete) functionality for flashcards.
- **Deck Organization**: Group flashcards into thematic decks.
- **Simple Study Mechanism**: Archive "remembered" cards to focus on new material.

### Out of Scope

- Advanced spaced repetition algorithms (e.g., SM-2).
- Importing from files (PDF, DOCX, etc.).
- Sharing or publishing decks.
- Integrations with third-party educational platforms.
- Dedicated mobile applications.

## Project Status

The project is currently **in development** and is focused on delivering the features outlined in the Minimum Viable Product (MVP) scope.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.
