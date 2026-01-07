import { NextResponse } from 'next/server';

interface PlanStep {
  id: number;
  type: 'file_write';
  description: string;
  path: string;
  content: string;
}

interface Plan {
  summary: string;
  estimatedTimeSeconds: number;
  steps: PlanStep[];
}

export async function POST() {
  await new Promise(resolve => setTimeout(resolve, 800));

  const plan: Plan = {
    summary: 'Counter app with React, TypeScript, and Tailwind CSS',
    estimatedTimeSeconds: 10,
    steps: [
      {
        id: 1,
        type: 'file_write',
        description: 'Create counter component',
        path: 'app/page.tsx',
        content: `'use client'

import { useState } from 'react';

export default function CounterApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Counter App</h1>
        <div className="text-6xl font-bold text-indigo-600 text-center mb-8">
          {count}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            Increment
          </button>
          <button 
            onClick={() => setCount(count - 1)}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Decrement
          </button>
          <button 
            onClick={() => setCount(0)}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}`,
      },
      {
        id: 2,
        type: 'file_write',
        description: 'Add custom counter styles',
        path: 'app/counter.css',
        content: `/* Counter Custom Styles */

.counter-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.counter-display {
  font-size: 4rem;
  font-weight: bold;
  color: #4f46e5;
  margin: 2rem 0;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.button-group button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.button-group button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}`,
      },
      {
        id: 3,
        type: 'file_write',
        description: 'Add global styles',
        path: 'app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground: #1a1a1a;
  --background: #ffffff;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: system-ui, -apple-system, sans-serif;
}`,
      },
    ],
  };

  return NextResponse.json(plan);
}

export async function GET() {
  return NextResponse.json({
    summary: 'Test endpoint working',
    estimatedTimeSeconds: 1,
    steps: [
      {
        id: 1,
        type: 'file_write',
        description: 'Quick test file',
        path: 'test.tsx',
        content: '// API is working\nconsole.log("Hello World");',
      },
    ],
  });
}
