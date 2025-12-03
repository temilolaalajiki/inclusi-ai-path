import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  age: z.string().min(1, "Age is required"),
  grade: z.string().min(1, "Grade/Class is required"),
  learningChallenges: z.array(z.string()).default([]),
  accessibilityNeeds: z.array(z.string()).default([]),
  dataConsent: z.boolean().refine(val => val === true, {
    message: "You must consent to data processing to continue"
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const challengeOptions = [
  "Dyslexia",
  "ADHD",
  "Autism Spectrum",
  "Processing Difficulties",
  "Memory Challenges",
  "Language Barriers",
];

const accessibilityOptions = [
  "Visual Impairment",
  "Hearing Impairment",
  "Mobility Support",
  "Assistive Technology",
  "Extra Time",
  "Quiet Environment",
];

interface LearnerProfileCompletionProps {
  userId: string;
  onComplete: () => void;
}

export const LearnerProfileCompletion = ({ userId, onComplete }: LearnerProfileCompletionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: "",
      grade: "",
      learningChallenges: [],
      accessibilityNeeds: [],
      dataConsent: false,
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      // Create learner record with teacher_id = NULL (pending assignment)
      const { error: learnerError } = await supabase
        .from('learners')
        .insert({
          user_id: userId,
          teacher_id: null,
          demographics: { age: values.age, grade: values.grade },
          learning_challenges: values.learningChallenges,
          accessibility_needs: values.accessibilityNeeds,
        });

      if (learnerError) throw learnerError;

      // Create consent record
      await supabase
        .from('user_data_consent')
        .upsert({
          user_id: userId,
          analytics_consent: values.dataConsent,
          ai_processing_consent: values.dataConsent,
          consent_date: new Date().toISOString(),
        });

      toast({
        title: "Profile Created!",
        description: "Your profile has been submitted. An administrator will assign you to a teacher soon.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          Please fill in your information to complete your learner profile. 
          An administrator will then assign you to a teacher.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade/Class</FormLabel>
                    <FormControl>
                      <Input placeholder="JSS 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="learningChallenges"
              render={() => (
                <FormItem>
                  <FormLabel>Learning Challenges (Optional)</FormLabel>
                  <FormDescription>Select any that apply to you</FormDescription>
                  <div className="grid gap-3 md:grid-cols-2">
                    {challengeOptions.map((challenge) => (
                      <FormField
                        key={challenge}
                        control={form.control}
                        name="learningChallenges"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(challenge)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, challenge]
                                      : current.filter((v) => v !== challenge)
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {challenge}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessibilityNeeds"
              render={() => (
                <FormItem>
                  <FormLabel>Accessibility Needs (Optional)</FormLabel>
                  <FormDescription>Select any support you need</FormDescription>
                  <div className="grid gap-3 md:grid-cols-2">
                    {accessibilityOptions.map((need) => (
                      <FormField
                        key={need}
                        control={form.control}
                        name="accessibilityNeeds"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(need)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, need]
                                      : current.filter((v) => v !== need)
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {need}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I consent to data processing
                    </FormLabel>
                    <FormDescription>
                      I agree to have my educational data processed to provide personalized 
                      learning recommendations and support.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Complete Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
