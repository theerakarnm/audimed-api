## 1. General Instructions

### Overview

This project is a full-stack application designed for medical diagnosis and patient management. It consists of two main parts: a web-based frontend and a backend API. The frontend, built with Remix and React, provides a user interface for patient information management, diagnosis input, and data visualization. The backend, powered by Hono and Bun, handles data processing, and interactions with a PostgreSQL database.

### Environment Setup

To run this project, you need to have Node.js, Bun, and Docker installed.

**Backend API:**
1. Navigate to the `api` directory.
2. Install dependencies: `bun install`
3. Run the development server: `bun run dev`
The API will be available at `http://localhost:3000`.

**Frontend Web Application:**
1. Navigate to the `web` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
The web application will be accessible at the port specified by the Remix development server.

## 2. Coding Style

The project uses TypeScript for both the frontend and backend. It follows standard TypeScript and React coding conventions. ESLint is configured for the web application to enforce code quality and consistency.

- Use functional components and hooks in React.
- Maintain a consistent file and folder structure.
- Use descriptive names for variables, functions, and components.

## 3. Regarding Dependencies

The project uses several dependencies for different functionalities.

**Backend API:**
- `hono`: A small, simple, and ultrafast web framework for the Edge.
- `drizzle-orm`: A TypeScript ORM for SQL databases.
- `pg`: A PostgreSQL client for Node.js.
- `zod`: A TypeScript-first schema declaration and validation library.

**Frontend Web Application:**
- `remix`: A full-stack web framework that lets you focus on the user interface and work back through web standards to deliver a fast, slick, and resilient user experience.
- `react`: A JavaScript library for building user interfaces.
- `tailwindcss`: A utility-first CSS framework for rapid UI development.
- `radix-ui`: A collection of unstyled, accessible UI components.
- `recharts`: A composable charting library built on React components.
- `axios`: A promise-based HTTP client for the browser and Node.js.

## 4. Project Structure

The project is organized into two main directories: `api` and `web`.

**`api` Directory:**
- `src/`: Contains the source code for the backend API.
  - `routes/`: Defines the API endpoints.
  - `services/`: Contains the business logic for different services.
  - `schemas/`: Defines the data schemas using Zod.
  - `utils/`: Contains utility functions and database configurations.
- `drizzle.config.ts`: The configuration file for Drizzle ORM.

**`web` Directory:**
- `app/`: Contains the source code for the Remix application.
  - `routes/`: Defines the application routes.
  - `components/`: Contains reusable React components.
  - `hooks/`: Contains custom React hooks.
  - `libs/`: Contains utility functions and other libraries.
- `public/`: Contains static assets like images and fonts.
- `vite.config.ts`: The configuration file for Vite.

## 5. Security Practices

- **Input Validation:** All incoming data to the API is validated using Zod schemas to prevent common security vulnerabilities like injection attacks.
- **Environment Variables:** Sensitive information like database credentials and API keys are stored in environment variables and are not hardcoded in the source code.
- **Dependencies:** Regularly update dependencies to their latest versions to patch any security vulnerabilities.

## 6. Performance Considerations

- **Code Splitting:** Remix automatically splits the code by route, so users only download the code they need for the current page.
- **Caching:** Use appropriate caching strategies for API responses and static assets to reduce server load and improve response times.
- **Database Indexing:** Ensure that the database tables are properly indexed to speed up query performance.

## 7. Troubleshooting

- **API Errors:** Check the API server logs for any error messages. Ensure that the database is running and accessible.
- **Frontend Issues:** Use the browser's developer tools to check for any console errors. Verify that the API is running and responding correctly.
- **Dependency Problems:** If you encounter any issues with the dependencies, try deleting the `node_modules` directory and reinstalling them.