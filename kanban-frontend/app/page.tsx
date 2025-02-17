import Image from "next/image";
import KanbanBoard from "@/components/KanbanBoard";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <KanbanBoard />
    </main>
  )
}
