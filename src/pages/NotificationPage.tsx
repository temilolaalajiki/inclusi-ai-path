import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Info, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useEffect } from 'react';

const NotificationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifications, markAsRead, deleteNotification, loading } = useNotifications();

  const notification = notifications.find((n) => n.id === id);

  useEffect(() => {
    if (notification && !notification.is_read) {
      markAsRead(notification.id);
    }
  }, [notification, markAsRead]);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getCategoryBadge = (category: Notification['category']) => {
    const variants: Record<string, string> = {
      attendance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      performance: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      system: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return (
      <span className={`text-sm px-3 py-1 rounded-full ${variants[category]}`}>
        {category}
      </span>
    );
  };

  const handleDelete = async () => {
    if (notification) {
      await deleteNotification(notification.id);
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Notification not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{notification.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  {getCategoryBadge(notification.category)}
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {notification.message}
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Received on {format(new Date(notification.created_at), 'PPpp')}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPage;
