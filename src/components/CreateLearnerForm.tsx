import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const learnerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  age: z.string().min(1, "Age is required"),
  grade: z.string().min(1, "Grade/Class is required"),
  learningChallenges: z.array(z.string()).default([]),
  accessibilityNeeds: z.array(z.string()).default([]),
});

type LearnerFormValues = z.infer<typeof learnerSchema>;

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

interface CreateLearnerFormProps {
  onSuccess: () => void;
  onBulkUploadClick: () => void;
}

export const CreateLearnerForm = ({ onSuccess, onBulkUploadClick }: CreateLearnerFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LearnerFormValues>({
    resolver: zodResolver(learnerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      grade: "",
      learningChallenges: [],
      accessibilityNeeds: [],
    },
  });

  const onSubmit = async (values: LearnerFormValues) => {
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create auth user for the learner
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        email_confirm: true,
        user_metadata: {
          first_name: values.firstName,
          last_name: values.lastName,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          first_name: values.firstName,
          last_name: values.lastName,
        });

      if (profileError) throw profileError;

      // Create user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "learner",
        });

      if (roleError) throw roleError;

      // Create learner record
      const { error: learnerError } = await supabase
        .from("learners")
        .insert({
          user_id: authData.user.id,
          teacher_id: user.id,
          demographics: { age: values.age, grade: values.grade },
          learning_challenges: values.learningChallenges,
          accessibility_needs: values.accessibilityNeeds,
        });

      if (learnerError) throw learnerError;

      toast({
        title: "Success",
        description: "Learner created successfully",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create learner",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Create Learner
        </CardTitle>
        <CardDescription>Add a new student to your class</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="student@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  <FormItem className="md:col-span-2">
                    <FormLabel>Grade/Class</FormLabel>
                    <FormControl>
                      <Input placeholder="7th Grade" {...field} />
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
                  <FormLabel>Learning Challenges</FormLabel>
                  <FormDescription>Select all that apply</FormDescription>
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
                  <FormLabel>Accessibility Needs</FormLabel>
                  <FormDescription>Select all that apply</FormDescription>
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

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Learner"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBulkUploadClick}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload Learners
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
