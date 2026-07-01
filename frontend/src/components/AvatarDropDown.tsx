import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { getChars } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const AvatarDropDown = () => {
    const {user, logout} = useAuth()
    const navigate = useNavigate()
    const handleLogout = () : void => {
        logout()
        navigate('/login')
    }
  return (
    user && (
        <Popover>
      <PopoverTrigger asChild>
        <Avatar>
          <AvatarFallback>
            {getChars(user.full_name as string)}
          </AvatarFallback>
          <span className="sr-only">My Account</span>
        </Avatar>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-64 bg-background/10 backdrop-blur-sm border border-primary/30 rounded-xl p-0"
      >
        <div className="flex flex-col gap-2 p-4">
          <h1 className="text-base text-foreground font-semibold">
            {user.full_name}
          </h1>
          <p className="text-xs text-secondary-foreground truncate">
            {user?.email}
          </p>
            <Button
            onClick={handleLogout}
              className="text-xs w-full rounded-b-xl"
              variant="ghost"
              size="sm"
            >
              Logout
            </Button>
        </div>
      </PopoverContent>
    </Popover>
    )
  );
};

export default AvatarDropDown;
