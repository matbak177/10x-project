"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Flashcard } from "./columns";

const formSchema = z.object({
  front: z.string().min(1, "Pytanie nie może być puste.").max(200, "Pytanie jest za długie."),
  back: z.string().min(1, "Odpowiedź nie może być pusta.").max(500, "Odpowiedź jest za długa."),
});

interface FlashcardFormProps {
  flashcard?: Flashcard;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isSubmitting: boolean;
}

export function FlashcardForm({ flashcard, onSubmit, isSubmitting }: FlashcardFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      front: flashcard?.front ?? "",
      back: flashcard?.back ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pytanie</FormLabel>
              <FormControl>
                <Input placeholder="Wpisz pytanie..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Odpowiedź</FormLabel>
              <FormControl>
                <Textarea placeholder="Wpisz odpowiedź..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </form>
    </Form>
  );
}
