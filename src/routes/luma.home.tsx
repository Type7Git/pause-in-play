import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/luma/Home";

export const Route = createFileRoute("/luma/home")({ component: Home });
