import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export const ExternalLinkButton = ({ href, text }: { href: string; text: string }) => {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "text-violet-300" : "text-violet-700";
  return (
    <div className="w-full">
      <Link
        className={`flex items-center justify-center gap-3 text-lg w-full rounded-xl h-[50px] border font-semibold ${textColor} border-violet-400 bg-[#8b5cf650] hover:bg-[#6d28d950]`}
        // className={`flex items-center justify-center gap-3 text-lg w-full rounded-xl h-[50px] font-semibold ${textColor} bg-gradient-to-b from-custom-beige-start to-custom-beige-end to-100%">
        rel="noopener noreferrer"
        target="_blank"
        href={href}
      >
        {text}
        <ArrowTopRightOnSquareIcon className="w-5 h-5 mb-0.5" />
      </Link>
    </div>
  );
};
