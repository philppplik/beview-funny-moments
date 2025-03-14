
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import BeRealPost, { BeRealPostSkeleton } from "@/components/BeRealPost";
import { Button } from "@/components/ui/button";
import { beRealApi, BeRealPost as BeRealPostType } from "@/services/beRealApiService";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [posts, setPosts] = useState<BeRealPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchPosts = async (pageNum = 0, refresh = false) => {
    if (!isAuthenticated) return;
    
    if (refresh) {
      setRefreshing(true);
    } else if (pageNum === 0) {
      setIsLoading(true);
    }

    try {
      const newPosts = await beRealApi.getFriendsFeed(pageNum);
      
      if (refresh || pageNum === 0) {
        setPosts(newPosts);
      } else {
        setPosts(current => [...current, ...newPosts]);
      }
      
      setHasMore(newPosts.length > 0);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast({
        title: "Error",
        description: "Failed to load BeReal posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(0, true);
    setPage(0);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (!authLoading && isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-md">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">BeReal Feed</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex gap-2 items-center"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            // Show skeletons when loading
            Array.from({ length: 3 }).map((_, index) => (
              <BeRealPostSkeleton key={`skeleton-${index}`} />
            ))
          ) : posts.length > 0 ? (
            // Show posts
            posts.map(post => (
              <BeRealPost
                key={post.id}
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
            ))
          ) : (
            // Show empty state
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No BeReal posts found</p>
            </div>
          )}

          {/* Load more button */}
          {!isLoading && posts.length > 0 && hasMore && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
