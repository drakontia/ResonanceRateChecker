export default function PriceDisplay({ price }: { price: string | number }) {
  return (
    <p className="text-xl text-gray-900 dark:text-white">
      {Number(price).toLocaleString()}
    </p>
  );
}
