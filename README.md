# PersonaAI

PersonaAI is a Next.js application that allows users to create and interact with personalized AI personas. The application uses OpenAI's GPT and DALL·E APIs to generate unique personas and avatars based on user preferences.

## Features

- Multi-step onboarding process to create a personalized AI persona
- AI-generated avatar using DALL·E
- Interactive chat interface with the AI persona
- Responsive design with Tailwind CSS
- State management with Zustand
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/personaai.git
   cd personaai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:

   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
- `/src/store` - Zustand state management
- `/src/utils` - API utilities and helper functions
- `/src/types` - TypeScript type definitions

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Zustand
- OpenAI API

## License

This project is licensed under the MIT License - see the LICENSE file for details.
#   p e r s o n a - a i  
 