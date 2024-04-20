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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


const formSchema = z.object({
  questionText: z.string().min(1).max(500),
  answerText: z.string().min(1).max(150),
});

interface QuestionFormProps {
  
}

export const CreateTFQuestionForm: FC<QuestionFormProps> = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: "",
      answerText: "",
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
                  <FormLabel>True/False Question</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                    <Input type="textarea" {...field} />
                    <div className="">
                      <RadioGroup defaultValue="option-one">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-one" id="option-one" />
                          <Label htmlFor="option-one">True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-two" id="option-two" />
                          <Label htmlFor="option-two">False</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    </div>
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
