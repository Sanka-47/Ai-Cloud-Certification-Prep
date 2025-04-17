"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg shadow-cyan-500/20 p-8 transform transition-all hover:scale-105">
        {/* Header with Logo and Branding */}
        <div className="flex flex-col items-center mb-8">
          
          <h2 className="text-3xl font-bold text-cyan-400">CloudPrep</h2>
          <p className="text-gray-400 mt-2 text-center">
            Master cloud certifications with AI-powered quizzes
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!isSignIn && (
              <div className="relative">
                <label
                  htmlFor="name"
                  className="block text-gray-300 text-sm mb-1"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...form.register("name")} // Using form.register to bind the input to React Hook Form
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <label
                htmlFor="email"
                className="block text-gray-300 text-sm mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...form.register("email")} // Using form.register to bind the input to React Hook Form
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-gray-300 text-sm mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...form.register("password")} // Using form.register to bind the input to React Hook Form
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-500 text-gray-900 font-semibold py-3 rounded-lg hover:bg-cyan-400 transition-all"
            >
              {isSignIn ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </Form>

        {/* Toggle between Sign In and Sign Up */}
        <p className="text-center text-gray-400 mt-6">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="text-cyan-400 font-semibold ml-2 hover:underline"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
);
};

export default AuthForm;
