
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { beRealApi, BeRealPost } from "@/services/beRealApiService";
import BeRealPostComponent, { BeRealPostSkeleton } from "@/components/BeRealPost";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BeRealPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPost = await beRealApi.getPostById(id);
        
        if (!fetchedPost) {
          setError("Post not found");
          return;
        }
        
        setPost(fetchedPost);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post");
        toast({
          title: "Error",
          description: "Failed to load BeReal post. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, toast]);

  return (
    <Layout>
      <div className="container py-8 max-w-md">
        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0">
            <Link to="/explore" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <BeRealPostSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">{error}</p>
            <Button asChild className="mt-4">
              <Link to="/">Go back to feed</Link>
            </Button>
          </div>
        ) : post ? (
          <BeRealPostComponent
            id={post.id}
            username={post.user.username}
            userAvatar={post.user.profilePicture}
            caption={post.caption}
            mainPhoto={post.primary}
            selfiePhoto={post.secondary}
            location={post.location}
            timestamp={post.takenAt}
            likes={post.realmojis.length}
            comments={post.comments}
          />
        ) : null}
      </div>
    </Layout>
  );
};

export default PostDetail;
