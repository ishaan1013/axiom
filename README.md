# Axiom (Local)

An editor interface for George, for [SE212 (Logic and Computation)](https://student.cs.uwaterloo.ca/~se212/notes.html) at the University of Waterloo.

## Features

- **Multiplayer collaboration with [Workspaces](#workspaces)**
  - Invite classmates by WatIAM ID
  - Manage collaborators and invitations
  - View other cursors and selections
- **Intelligent language support**
  - Auto-incrementing line numbers
  - TODO: Auto-decrementing line numbers (`⌘+X` or `⌘+⌫`)
  - Auto-updating rule references
  - Auto-closing braces and indentations
  - Comments (`⌘+/`)
  - Jump to line definition (`⌘+Click`)
  - Hover tooltip for rule definitions
  - Boundaries above and below at `#check {x}`
  - Remove empty lines with line numbers with `⏎`
- **User interface**
  - Tabs for opening multiple files
  - Collapsible and resizable panels
    - Sidebar explorer (`⌘+B`)
    - George output (`⌘+J`)
  - Keyboard shortcuts for all major features
  - VSCode-like editor features and shortcuts (we use the same editor library as VSCode)
  - Local assignment and project files, persisted in local storage
  - Upload a `.grg` file into the current tab (`⌘+U`)
  - Download the current file
- **Settings menu (`⌘+K`)**
  - Light/dark mode
  - Toggle autocomplete
  - Individually customizable editor colours

## Workspaces

Workspaces are shared folders for multiplayer collaboration. You can create a workspace by clicking the `+` button in the sidebar. You can invite and manage collaborators by clicking on the three dots or right-clicking on a workspace. You can view your invitations in Settings>Invites (`⌘+K`).

Workspace rules:

- **Permissionless**
  - Any user in a workspace has equal permission to invite users, revoke invitations, remove collaborators, edit files, and delete the workspace
  - Only invite users you trust!
- **Unique folder**
  - You can only have one workspace for a folder. For example, you cannot have more than one workspace for `Project 1`.
  - You can not accept an invitation to a workspace for a folder that you already have access to.
- **One at a time**
  - You can only have one workspace open at a time in the editor
  - Temporary limitation for backend simplicity, may be lifted in the future

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for information on contributing to Axiom.

## Running Locally

### Frontend

We use Next.js 14 + Typescript, as well as these libraries:

- Monaco editor
- Y.js
- Socket.io
- Tanstack Query
- TailwindCSS
- Shadcn UI

Set up environment variables in `frontend/.env.local`:

```
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

Run the frontend:

```
cd frontend
npm i
npm run dev
```

> [!WARNING]
> Since we're running locally without Waterloo's authentication, you must set the `watiam` property in local storage to your WatIAM ID (or any string).
> Then create a user in the DB with that WatIAM ID for everything to work. The easiest way to do this is with prisma studio (run `npx prisma studio` in the backend directory).

### Backend

We use a Typescript + Express + Node.js server for our HTTP and WebSockets server, as well as these libraries:

- Socket.io
- Y.js
- Prisma

Set up environment variables in `backend/.env`:

```
DATABASE_URL="file:./dev.db"
```

Run the backend:

```
cd backend
npm i
npm run dev
```

#### Prisma

1. Compile the Prisma Schema

```
npx prisma generate
```

2. Run a migration to create your database tables with Prisma Migrate

```
npx prisma migrate dev --name init
```

3. (Optional) Run the seed to initialize it with some values

```
npx prisma db seed
```

4. Explore the data in Prisma Studio

```
npx prisma studio
```
