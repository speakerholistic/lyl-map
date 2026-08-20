'use client';

export default function UrgencyBanner() {
  return (
    <div className="bg-[#111827] border-b border-gray-800 px-6 py-3">
      <div className="max-w-screen-xl mx-auto flex items-start gap-3">
        <span
          className="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full bg-red-500 pulse-dot"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-white">Federal Funding Alert: </span>
          As federal funding pressures mount on care homes across the country, properties are
          increasingly understaffed and overfilled. Use the{' '}
          <span className="text-blue-400 font-medium">Direct Comparison Tool</span> to ensure your
          family member isn't placed in a high-risk environment.
        </p>
      </div>
      <style jsx global>{`
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        .pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
