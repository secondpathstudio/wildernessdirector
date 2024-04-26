'use client';

import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth, useFirestore, useFirestoreDocData, useFirestoreDocDataOnce, useFirestoreDocOnce } from "reactfire";
import { GoogleAuthProvider, getRedirectResult, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { ModalForgotPassword } from "@/components/auth/modal-forgot-password";
import { useRouter } from "next/navigation";
import { doc } from "firebase/firestore";


const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

interface SignInFormProps {
  onShowSignUp: () => void;
}

export const SignInForm: FC<SignInFormProps> = ({ onShowSignUp }) => {
  const firestore = useFirestore();
  const auth = useAuth();
  const [isResetOpen, setIsResetOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });


  const login = async ({ email, password }: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (result.user) {
        console.log("get user data")
        // const userDoc = doc(firestore, `users/${result.user.uid}`);
        // const userData = await useFirestoreDocDataOnce(userDoc);
        // if (userData.exists) {
        //   // user exists
        //   return;
        // }

        // await userDoc.set({
        //   email: result.user.email,
        //   name: result.user.displayName || "",
        //   createdAt: new Date().toISOString(),
        // });
      }

      toast({
        title: "Success!",
        description: "You have been signed in.",
      });
    } catch (error) {
      toast({ title: "Error Signing In", description: `${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm">
        Forgot password?{" "}
        <Button variant="link" onClick={() => setIsResetOpen(true)}>
          Reset
        </Button>
      </p>
      <p className="text-sm">
        Not a member?{" "}
        <Button variant="link" onClick={onShowSignUp}>
          Sign up instead.
        </Button>
      </p>
      <ModalForgotPassword isOpen={isResetOpen} setIsOpen={setIsResetOpen} />
    </>
  );
};
