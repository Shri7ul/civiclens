export default function Card({
  title,
  value,
  color
}) {

  return (
    <div className={`p-6 rounded-2xl ${color}`}>

      <h2 className="text-lg text-zinc-300 mb-2">
        {title}
      </h2>

      <h1 className="text-4xl font-bold text-white">
        {value}
      </h1>

    </div>
  );
}