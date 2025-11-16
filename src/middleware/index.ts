import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && context.url.pathname === "/generate") {
    return context.redirect("/login");
  }

  if (user && (context.url.pathname === "/login" || context.url.pathname === "/register")) {
    return context.redirect("/generate");
  }

  context.locals.user = user;
  context.locals.supabase = supabase;

  return next();
});
