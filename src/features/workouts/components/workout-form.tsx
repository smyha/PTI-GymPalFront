'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createWorkoutSchema, type CreateWorkoutFormData } from '../schemas/workout.schema';
import { useCreateWorkout } from '../hooks/use-workouts';

export function WorkoutForm() {
  const { mutate: createWorkout, isPending } = useCreateWorkout();

  const form = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      name: '',
      description: '',
      exercises: [],
    },
  });

  const onSubmit = (data: CreateWorkoutFormData) => {
    createWorkout(data);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Workout</CardTitle>
        <CardDescription>Plan your workout routine and track your progress</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Upper Body Routine" {...field} />
                  </FormControl>
                  <FormDescription>Give your workout a memorable name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Focus on chest and shoulders..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exercises"
              render={() => (
                <FormItem>
                  <FormLabel>Exercises</FormLabel>
                  <FormDescription>Add at least one exercise to your workout</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Creating...' : 'Create Workout'}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


