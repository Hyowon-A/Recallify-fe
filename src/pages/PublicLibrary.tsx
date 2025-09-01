import Layout from "./_Layout";
import DeckCard from "../components/DeckCard";
import SectionHeader from "../components/SectionHeader";
import { useNavigate } from "react-router-dom";

type Deck = { id: string; title: string; count: number };

const pubMcq: Deck[] = Array.from({ length: 8 }, (_, i) => ({
  id: `pub-mcq-${i + 1}`,
  title: "Comp. Architecture",
  count: 30,
}));
const pubFlash: Deck[] = Array.from({ length: 4 }, (_, i) => ({
  id: `pub-fc-${i + 1}`,
  title: "Comp. Architecture",
  count: 30,
}));

export default function Dashboard() {
  const nav = useNavigate();

  const handleAddMCQ = () => {
    // TODO: open create-modal or navigate to builder
    alert("Add MCQ set");
  };
  const handleAddFlash = () => {
    alert("Add Flashcard set");
  };
  const handleLearn = (id: string) => nav(`/learn/${id}`);
  const handleEdit = (id: string) => nav(`/decks/${id}/edit`);

  return (
    <Layout>
      {/* MCQ sets */}
      <section className="mb-8">
        <SectionHeader title="MCQ sets" onAdd={handleAddMCQ} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {pubMcq.map((d) => (
            <DeckCard key={d.id} deck={d} onLearn={handleLearn} onEdit={handleEdit} />
          ))}
        </div>
      </section>

      {/* Flashcard sets */}
      <section>
        <SectionHeader title="Flashcard sets" onAdd={handleAddFlash} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {pubFlash.map((d) => (
            <DeckCard key={d.id} deck={d} onLearn={handleLearn} onEdit={handleEdit} />
          ))}
        </div>
      </section>
    </Layout>
  );
}