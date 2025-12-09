import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserPlus, GraduationCap } from "lucide-react";
import { CreateTeacherForm } from "@/components/CreateTeacherForm";
import { CreateLearnerForm } from "@/components/CreateLearnerForm";

interface ManagementSectionProps {
  onTeacherCreated: () => void;
  onLearnerCreated: () => void;
}

export const ManagementSection = ({ onTeacherCreated, onLearnerCreated }: ManagementSectionProps) => {
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [learnerModalOpen, setLearnerModalOpen] = useState(false);

  const handleTeacherSuccess = () => {
    onTeacherCreated();
    setTeacherModalOpen(false);
  };

  const handleLearnerSuccess = () => {
    onLearnerCreated();
    setLearnerModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
        <p className="text-muted-foreground">Select an option to create a new user account</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {/* Create Learner Card */}
        <Card 
          className="cursor-pointer group hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:scale-[1.02]"
          onClick={() => setLearnerModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Create Learner</h3>
            <p className="text-sm text-muted-foreground">
              Add a new student to the system with profile, challenges, and accessibility needs
            </p>
          </CardContent>
        </Card>

        {/* Create Teacher Card */}
        <Card 
          className="cursor-pointer group hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:scale-[1.02]"
          onClick={() => setTeacherModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Create Teacher</h3>
            <p className="text-sm text-muted-foreground">
              Add a new teacher account to manage learners and create content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Creation Modal */}
      <Dialog open={teacherModalOpen} onOpenChange={setTeacherModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Teacher Account
            </DialogTitle>
            <DialogDescription>
              Add a new teacher to the system. They will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <CreateTeacherFormModal onSuccess={handleTeacherSuccess} onCancel={() => setTeacherModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Learner Creation Modal */}
      <Dialog open={learnerModalOpen} onOpenChange={setLearnerModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Create Learner Account
            </DialogTitle>
            <DialogDescription>
              Add a new student with their profile information, learning challenges, and accessibility needs.
            </DialogDescription>
          </DialogHeader>
          <CreateLearnerFormModal onSuccess={handleLearnerSuccess} onCancel={() => setLearnerModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Modal-specific form components without the Card wrapper
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const teacherSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z.string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface ModalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateTeacherFormModal = ({ onSuccess, onCancel }: ModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const onSubmit = async (values: TeacherFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('create-teacher', {
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Teacher account created successfully",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Teacher creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} />
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
                  <Input placeholder="Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="teacher@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <UserPlus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const learnerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  age: z.string().min(1, "Age is required"),
  grade: z.string().min(1, "Grade/Class is required"),
  teacherId: z.string().min(1, "Teacher assignment is required"),
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

const gradeOptions = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1",
  "SSS 2",
  "SSS 3",
];

const CreateLearnerFormModal = ({ onSuccess, onCancel }: ModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  const form = useForm<LearnerFormValues>({
    resolver: zodResolver(learnerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      grade: "",
      teacherId: "",
      learningChallenges: [],
      accessibilityNeeds: [],
    },
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, profiles(first_name, last_name)')
        .eq('role', 'teacher');

      if (error) {
        console.error('Error fetching teachers:', error);
        return;
      }

      const teacherList = data.map((item: any) => ({
        id: item.user_id,
        name: `${item.profiles.first_name} ${item.profiles.last_name}`.trim() || 'Unknown Teacher',
      }));

      setTeachers(teacherList);
    };

    fetchTeachers();
  }, []);

  const onSubmit = async (values: LearnerFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('create-learner', {
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          age: values.age,
          grade: values.grade,
          teacherId: values.teacherId,
          learningChallenges: values.learningChallenges,
          accessibilityNeeds: values.accessibilityNeeds,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormItem>
                <FormLabel>Grade/Class</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Teacher</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="grid gap-2 md:grid-cols-2">
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
                        <FormLabel className="font-normal cursor-pointer text-sm">
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
              <div className="grid gap-2 md:grid-cols-2">
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
                        <FormLabel className="font-normal cursor-pointer text-sm">
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

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <GraduationCap className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Learner"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
