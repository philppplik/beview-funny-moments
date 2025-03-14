
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { beRealApi, BeRealPost } from "@/services/beRealApiService";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Explore = () => {
  const [posts, setPosts] = useState<BeRealPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async (pageNum = 0) => {
    try {
      setIsLoading(true);
      const fetchedPosts = await beRealApi.getDiscoveryFeed(pageNum);
      
      if (pageNum === 0) {
        setPosts(fetchedPosts);
      } else {
        setPosts(current => [...current, ...fetchedPosts]);
      }
      
      setHasMore(fetchedPosts.length > 0);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast({
        title: "Error",
        description: "Failed to load discovery feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Explore BeReals</h1>

        {isLoading && posts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden">
                <Skeleton className="aspect-[4/5] w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {posts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id}>
                <Card className="overflow-hidden hover:opacity-90 transition-opacity">
                  <div className="relative aspect-[4/5]">
                    <img
                      src={post.primary}
                      alt={`BeReal by ${post.user.username}`}
                      className="object-cover w-full h-full"
                    />
                    <img
                      src={post.secondary}
                      alt={`Selfie by ${post.user.username}`}
                      className="absolute top-2 right-2 w-1/3 h-1/3 object-cover rounded"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-sm truncate">{post.user.username}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No BeReal posts found</p>
            <Button asChild className="mt-4">
              <Link to="/">Go back to feed</Link>
            </Button>
          </div>
        )}

        {!isLoading && posts.length > 0 && hasMore && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMore} variant="outline">
              Load More
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;
