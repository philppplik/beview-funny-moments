
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BeRealPostProps {
  id: string;
  username: string;
  userAvatar?: string;
  caption?: string;
  mainPhoto: string;
  selfiePhoto: string;
  location?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export default function BeRealPost({
  username,
  userAvatar,
  caption,
  mainPhoto,
  selfiePhoto,
  location,
  timestamp,
  likes,
  comments,
}: BeRealPostProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLoading, setIsLoading] = useState(true);

  const toggleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userAvatar} alt={username} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{username}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{timestamp}</span>
              {location && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{location}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bereal-container">
          {isLoading && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted">
              <div className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
              </div>
            </div>
          )}
          <img
            src={mainPhoto}
            alt="BeReal main photo"
            className="bereal-main-photo"
            onLoad={handleImageLoad}
          />
          <img
            src={selfiePhoto}
            alt="BeReal selfie"
            className="bereal-selfie"
            onLoad={handleImageLoad}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLike}
            className={liked ? "text-red-500" : ""}
          >
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-sm">
          <span className="font-medium">{likeCount} likes</span> • <span>{comments} comments</span>
        </div>
        {caption && (
          <div className="text-sm mt-1">
            <span className="font-medium">{username}</span> <span>{caption}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export function BeRealPostSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bereal-container bg-muted relative">
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
          <div className="absolute top-4 right-4 w-1/3 h-1/3 rounded-md bg-muted-foreground/20"></div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <div className="flex items-center gap-4 w-full">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
        <Skeleton className="h-4 w-32 mt-1" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </CardFooter>
    </Card>
  );
}
