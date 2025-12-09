"use client"

import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export default function Navbar() {
  const isMobile = useIsMobile()

  return (
    <NavigationMenu viewport={isMobile} className="mb-4">
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuLink>
            <Link href="/" className="px-4 py-2 font-medium border-b-2 transition-colors border-blue-500 text-blue-400">ホーム</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
                <NavigationMenuItem>
          <NavigationMenuLink>
            <Link href="/overview" className="px-4 py-2 font-medium border-b-2 transition-colors border-blue-500 text-blue-400">商品一覧</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink>
            <Link href="/prices" className="px-4 py-2 font-medium border-b-2 transition-colors border-blue-500 text-blue-400">価格表</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
