import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { projectsApi, commentsApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/hooks/use-toast';
import type { Project, Comment } from '@/types';
import { UserRole, ProjectStatus } from '@/types';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [projectData, commentsData] = await Promise.all([
          projectsApi.getOne(id),
          commentsApi.getAll(id),
        ]);
        setProject(projectData);
        setComments(commentsData);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to fetch project',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const onSubmitComment = async (data: CommentFormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      const newComment = await commentsApi.create(id, data);
      setComments([...comments, newComment]);
      reset();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsApi.delete(id);
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        variant: 'success',
      });
      navigate('/projects');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Link to="/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to="/projects">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          {user?.role === UserRole.ADMIN && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link to={`/projects/${id}/edit`} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl">{project.name}</CardTitle>
                <CardDescription className="mt-2">
                  Created by {project.createdBy?.name || 'Unknown'}
                </CardDescription>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              {project.client && (
                <div>
                  <h3 className="font-semibold mb-2">Client</h3>
                  <p className="text-muted-foreground">{project.client.name} ({project.client.email})</p>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
            <CardDescription>Discussion and updates about this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-primary pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{comment.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
              )}

              <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="content">Add a comment</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your thoughts or updates..."
                    rows={3}
                    {...register('content')}
                  />
                  {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
