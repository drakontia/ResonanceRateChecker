export default function ItemName({ name }: { name: string }) {
  return (
    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
      {name}
    </p>
  );
}
