import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/lumenera/Home";

export const Route = createFileRoute("/home")({ component: Home });
