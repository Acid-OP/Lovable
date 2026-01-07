import { NextResponse } from 'next/server';

export async function POST() {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return some dummy generated code
  const dummyCode = `// AI Generated Code (Demo)
// This is just dummy code to show the generation flow

import React, { useState } from 'react';

function CounterApp() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="counter-container">
      <h1>🎯 Counter App</h1>
      <div className="counter-display">
        <h2>Count: {count}</h2>
      </div>
      <div className="button-group">
        <button onClick={increment}> Increment</button>
        <button onClick={decrement}> Decrement</button>
        <button onClick={reset}>🔄 Reset</button>
      </div>
    </div>
  );
}

export default CounterApp;`;

  return new NextResponse(dummyCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// Support GET for quick browser testing
export async function GET() {
  const testCode = `// Quick Test
console.log('API is working! 🚀');

function HelloWorld() {
  return <h1>Hello from the API!</h1>;
}`;

  return new NextResponse(testCode, {
    status: 200,
  });
}

