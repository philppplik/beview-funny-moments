
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeedPosts } from "@/services/berealService";
import { Link } from "react-router-dom";

const Explore = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const fetchedPosts = await getFeedPosts(1, 24);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Explore BeReals</h1>

        {isLoading ? (
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
                      src={post.mainPhoto}
                      alt={`BeReal by ${post.username}`}
                      className="object-cover w-full h-full"
                    />
                    <img
                      src={post.selfiePhoto}
                      alt={`Selfie by ${post.username}`}
                      className="absolute top-2 right-2 w-1/3 h-1/3 object-cover rounded"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-sm truncate">{post.username}</p>
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
      </div>
    </Layout>
  );
};

export default Explore;
