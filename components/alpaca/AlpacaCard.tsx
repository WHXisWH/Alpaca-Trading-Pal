import { AlpacaDisplayTraits } from "@/types/alpaca";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Image from "next/image";
import { memo } from "react";

interface AlpacaCardProps {
  alpaca: AlpacaDisplayTraits;
  tokenId: string;
}

const EVOLUTION_STAGES = ["Infant", "Adolescent", "Adult", "Master"];
const MOOD_EMOJIS: { [key: string]: string } = {
  Ecstatic: "🤩",
  Confident: "😎",
  Calm: "😐",
  Frustrated: "😠",
};

const AlpacaCard = memo(function AlpacaCard({ alpaca, tokenId }: AlpacaCardProps) {
  const getEvolutionImage = () => {
    switch (alpaca.evolutionStage) {
      case 1: return "/alpaca/moderate.webp"; // Adolescent
      case 2: return "/alpaca/aggressive.webp"; // Adult
      case 3: return "/alpaca/aggressive.webp"; // Master
      default: return "/alpaca/conservative.webp"; // Infant
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-amber-100 hover:-translate-y-1">
      <CardHeader className="text-center">
        <Image
          src={getEvolutionImage()}
          alt={`${alpaca.name} - ${EVOLUTION_STAGES[alpaca.evolutionStage]} stage`}
          width={200}
          height={200}
          className="mx-auto mb-4 rounded-full border-4 border-amber-300"
          priority={true}
        />
        <CardTitle className="text-3xl font-bold text-amber-900">
          {alpaca.name} <span title={`Mood: ${alpaca.mood}`}>{MOOD_EMOJIS[alpaca.mood] || "😐"}</span>
        </CardTitle>
        <p className="text-sm text-gray-500">Token ID: #{tokenId}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xs text-gray-500">Level</p>
            <p className="text-lg font-bold">{alpaca.level}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Stage</p>
            <p className="text-lg font-bold">{EVOLUTION_STAGES[alpaca.evolutionStage] || "Infant"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Trades</p>
            <p className="text-lg font-bold">{alpaca.totalTrades}</p>
          </div>
        </div>
        <div className="mt-4">
            <p className="text-xs text-gray-500 text-center">Experience</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${(alpaca.experience / (alpaca.level * 100)) * 100}%` }}
                ></div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { AlpacaCard };