import { Toggle } from "@/components/ui/toggle";
import { StarIcon } from "lucide-react";

interface CardProps {
  readonly children: React.ReactNode;
  readonly isFavorite?: boolean;
  readonly onToggleFavorite?: () => void;
}

export default function Card({ children, isFavorite, onToggleFavorite }: CardProps) {
  return (
    <div className="relative h-48 border shadow-sm rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <Toggle 
        value="star"
        aria-label="Toggle star"
        pressed={isFavorite}
        onPressedChange={onToggleFavorite}
        className="absolute top-2 right-2　data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500"
        size="sm"
      >
        <StarIcon />
      </Toggle>
      {children}
    </div>
  );
}
