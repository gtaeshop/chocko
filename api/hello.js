export const config = {
  runtime: 'edge', // Defines this as an Edge function
};

export default async function handler(req: Request) {
  const response = { message: 'Hello from the Edge!' };
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
}
