export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center text-sm text-gray-500">
      {text}
    </div>
  );
}