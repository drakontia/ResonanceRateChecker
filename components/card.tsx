export default function Card({ children, isFavorite, onToggleFavorite, darkMode }: { children: React.ReactNode; isFavorite?: boolean; onToggleFavorite?: () => void; darkMode?: boolean }) {
  return (
    <div className="relative h-48 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600 border shadow-sm rounded-xl p-8 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <span 
        className={`absolute top-2 right-2 text-xl cursor-pointer transition-colors ${isFavorite ? 'text-yellow-400' : 'text-gray-600'}`}
        onClick={onToggleFavorite}
      >
        ★
      </span>
      {children}
    </div>
  );
}
