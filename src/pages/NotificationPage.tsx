import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, Info, CheckCircle, AlertCircle, Trash2, Bell, LayoutDashboard } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardSidebar, SidebarMenuItem } from '@/components/dashboard/DashboardSidebar';
import { LoadingScreen } from '@/components/LoadingScreen';

const NotificationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifications, markAsRead, deleteNotification, loading } = useNotifications();
  const { user, userProfile, userRole, loading: authLoading } = useAuth();

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
      handleGoBack();
    }
  };

  const handleGoBack = () => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/learner');
    }
  };

  const menuItems: SidebarMenuItem[] = [
    { title: "Back to Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, value: "dashboard" },
    { title: "Notification", icon: <Bell className="h-4 w-4" />, value: "notification" },
  ];

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      handleGoBack();
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const sidebar = (
    <DashboardSidebar
      menuItems={menuItems}
      activeTab="notification"
      onTabChange={handleTabChange}
      userName={userProfile?.firstName || 'User'}
      userRole={userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
    />
  );

  const renderContent = () => {
    if (!notification) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Bell className="h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Notification not found</p>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
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
    );
  };

  return (
    <DashboardLayout
      sidebar={sidebar}
      title="Notification"
      subtitle="View notification details"
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default NotificationPage;
