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
import { Toggle } from "../ui/toggle";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"


const formSchema = z.object({
  questionText: z.string().min(1).max(500),
  answerText0: z.string().min(1).max(150),
  answerText1: z.string().min(1).max(150),
  answerText2: z.string().min(1).max(150),
  answerText3: z.string().min(1).max(150),
});

interface QuestionFormProps {
  
}

export const CreateMCQuestionForm: FC<QuestionFormProps> = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: "",
      answerText0: "",
      answerText1: "",
      answerText2: "",
      answerText3: "",
    },
  });

  const auth = useAuth();

  return (
    <>
      <Form {...form}>
        <form onSubmit={() => console.log("submitted")}>
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
            <div className="flex">
              <FormField
                control={form.control}
                name="answerText0"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Answer 1</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input className="grow" type="text" {...field} />
                        <Toggle>
                          <Check className={`text-gray-300`} />
                        </Toggle>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="answerText1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer 2</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answerText2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer 3</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answerText3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer 4</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
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
