import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Home</h1>

      <a href="/login">
        Ir para Login
      </a>
    </div>
  );
}