import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export default function MobileNav() {
  return (
    <div className="md:hidden fixed flex items-center justify-evenly bottom-0 z-50 bg-forest py-4 px-2 m-0 w-full text-ambient">
      <Link href="/search" className="flex flex-col items-center justify-evenly text-[8px] gap-1">
        <Icon
          icon="ic:round-search"
          className="w-[24px] h-[24px] flex-shrink-0"
        />
        Search
      </Link>
      <Link href="/upload" className="flex flex-col items-center justify-evenly text-[8px] gap-1">
        <Icon
          icon="icons8:plus"
          className="w-[24px] h-[24px] flex-shrink-0"
        />
        Upload
      </Link>
      <Link href="/home" className="flex flex-col items-center justify-evenly text-[8px] gap-1">
        <Image width={0} height={0} className="w-full h-full" src="/ambientLogo.png" alt={'logo'}/>
        Home
      </Link>
      <Link href="/messages" className="flex flex-col items-center justify-evenly text-[8px] gap-1">
        <Icon
          icon="mynaui:message-dots"
          className="w-[24px] h-[24px] flex-shrink-0"
        />
        Message
      </Link>
      <Link href="/settings" className="flex flex-col items-center justify-evenly text-[8px] gap-1">
        <Icon
          icon="material-symbols:settings"
          className="w-[24px] h-[24px] flex-shrink-0"
        />
        Settings
      </Link>
    </div>
  )
}
