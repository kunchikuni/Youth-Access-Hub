import Image from "next/image";
import Link from "next/link";
import DonateCard from "./components/DonateCard";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
    <main>
      <h1 className="text-4xl font-bold text-gray-800">Welcome to Youth Access Hub</h1>
        <Link href="/admin" className="mt-4 text-blue-500 hover:underline">Admin Page</Link>
      </main>
      <DonateCard />

    </div>
  );
}
