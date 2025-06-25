# NotesVault - Next.js Version

A beautiful note-taking application with mind mapping capabilities, now powered by Next.js 15.

## Features

- 📝 Rich note editing with markdown support
- 🔍 Powerful search functionality
- 🗺️ Interactive mind map visualization
- 📊 Note properties (mood, priority, category, status)
- 🔗 Note linking system
- 💾 Local storage persistence
- 🎨 Beautiful dark theme UI
- 📱 Responsive design

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **React Flow** - Mind map visualization
- **Lucide React** - Icons
- **TanStack Query** - Data fetching

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd bespoke-mind-garden
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Client providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── NoteEditor.tsx    # Note editing interface
│   ├── MindMapView.tsx   # Mind map visualization
│   └── ...               # Other components
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Usage

### Creating Notes

- Click the "+" button to create a new note
- Add a title and content using the rich text editor
- Set properties like mood, priority, category, and status

### Mind Map View

- Toggle to mind map view to see your notes visualized as an interactive graph
- Notes are connected based on their linking relationships
- Drag and zoom to navigate the mind map

### Linking Notes

- In the note properties panel, you can link notes together
- Linked notes will appear connected in the mind map view

### Search

- Use the search bar to find notes by title, content, or category
- Results update in real-time as you type

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Migration from Vite

This project was successfully migrated from Vite to Next.js 15. Key changes include:

- Converted to Next.js App Router structure
- Added proper `'use client'` directives for client components
- Updated TypeScript configuration for Next.js
- Migrated build scripts and configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
