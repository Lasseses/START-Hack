import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  
  export function UserAvatar() {
    return (
      <Avatar className="p-2">
        <AvatarImage src="./images/logo.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    )
  }
  