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
    <NavigationMenu className="mb-4">
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className="px-4 py-2 font-medium border-b-2">ホーム</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
                <NavigationMenuItem>
          <NavigationMenuLink asChild>
                    <Link href="/overview" className="px-4 py-2 font-medium border-b-2">商品一覧ページ</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/prices" className="px-4 py-2 font-medium border-b-2">価格表</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
