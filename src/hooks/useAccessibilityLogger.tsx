import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAccessibilityLogger = () => {
  const { toast } = useToast();

  const logAccessibilityFeature = async (
    featureType: 'tts' | 'high_contrast' | 'font_size' | 'keyboard_nav' | 'read_selection',
    featureValue?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user logged in, skipping accessibility log');
        return;
      }

      const { error } = await supabase
        .from('accessibility_logs')
        .insert({
          user_id: user.id,
          feature_type: featureType,
          feature_value: featureValue,
          page_url: window.location.pathname,
        });

      if (error) {
        console.error('Error logging accessibility feature:', error);
      }
    } catch (error) {
      console.error('Error in accessibility logger:', error);
    }
  };

  return { logAccessibilityFeature };
};