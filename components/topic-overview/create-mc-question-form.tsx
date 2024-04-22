'use client';

import * as React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "reactfire";
import { Checkbox } from "@/components/ui/checkbox"
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"


const questionSchema = z.object({
  id: z.string(),
  questionText: z.string().min(1).max(500),
  answers: z.array(z.object({
    id: z.string(),
    text: z.string().min(1).max(150),
    correct: z.boolean(),
  })),
  reference: z.string().min(1).max(150),
  explanation: z.string().min(1).max(500),
  topicId: z.string(),
})

type Question = z.infer<typeof questionSchema>;

const formSchema = z.object({
  questionText: z.string().min(1).max(500),
  answer0Text: z.string().min(1).max(150),
  answer1Text: z.string().min(1).max(150),
  answer2Text: z.string().min(1).max(150),
  answer3Text: z.string().min(1).max(150),
  referenceText: z.string().min(1).max(150),
  answer0Correct: z.boolean(),
  answer1Correct: z.boolean(),
  answer2Correct: z.boolean(),
  answer3Correct: z.boolean(),
});

interface QuestionFormProps {
  
}

export const CreateMCQuestionForm: FC<QuestionFormProps> = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: "",
      answer0Text: "",
      answer0Correct: false,
      answer1Text: "",
      answer1Correct: false,
      answer2Text: "",
      answer2Correct: false,
      answer3Text: "",
      answer3Correct: false,
      referenceText: "",
    },
  });

  const auth = useAuth();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    console.log(values)
  }

  return (
    <>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isLoading} className="space-y-4">
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Multiple Choice Question</FormLabel>
                  <FormControl>
                  <Textarea
                    placeholder="Write a new multiple choice question..."
                    className=""
                    {...field}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {Array.from({ length: 4 }).map((_, i) => (
              <div className="flex">
                <FormField
                  control={form.control}
                  name={`answer${i}Text`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Answer {i + 1}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1">
                          <Input className="grow" type="text" {...field} />
                          <Checkbox />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}            
            <FormField
                control={form.control}
                name="referenceText"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                        <Input className="grow" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Button type="submit">Create Question</Button>
          </fieldset>
        </form>
      </Form>
    </>
  );
};
