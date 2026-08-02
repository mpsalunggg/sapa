import Image from "next/image";

import { SAWERIA_URL } from "@/shared/lib/site";

export function SupportLink() {
  return (
    <a
      href={SAWERIA_URL}
      className="bg-background hover:border-sapa-warning/50 hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:bg-linear-to-br group inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="bg-background flex size-7 items-center justify-center rounded-full border shadow-sm">
        <Image
          src="/saweria.png"
          alt=""
          width={20}
          height={20}
          className="origin-bottom transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transform-none"
        />
      </span>
      Buy me a coffee
    </a>
  );
}
