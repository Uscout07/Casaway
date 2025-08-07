export default function Logo() {
  return (
    <div className="absolute top-5 left-2 flex items-center justify-center">
      <img
        src="/logo.svg"
        alt="Ambient Logo"
        className="w-12 h-12 md:w-16 md:h-16"
      />
    </div>
  );
}