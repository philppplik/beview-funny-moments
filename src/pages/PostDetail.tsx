
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { getPostById } from "@/services/berealService";
import BeRealPost, { BeRealPostSkeleton } from "@/components/BeRealPost";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPost = await getPostById(id);
        
        if (!fetchedPost) {
          setError("Post not found");
          return;
        }
        
        setPost(fetchedPost);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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
          <BeRealPost
            id={post.id}
            username={post.username}
            userAvatar={post.userAvatar}
            caption={post.caption}
            mainPhoto={post.mainPhoto}
            selfiePhoto={post.selfiePhoto}
            location={post.location}
            timestamp={post.timestamp}
            likes={post.likes}
            comments={post.comments}
          />
        ) : null}
      </div>
    </Layout>
  );
};

export default PostDetail;
