import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "./ui/navigation-menu";

export default function Navbar() {
  const { user } = useAuth()
  return (
    <NavigationMenu className="h-full font-medium">
      <NavigationMenuList className="h-full w-full gap-2 px-2 md:px-4">
        <NavigationMenuItem className="mr-auto">
          {/* <NavigationMenuLink className="text-base" asChild>
            <Link to={'/'}>Smart Project Tracking Assistant</Link>
          </NavigationMenuLink> */}
        </NavigationMenuItem>
        {user ? null : (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to={'/login'}>Login</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to={'/register'}>Register</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
