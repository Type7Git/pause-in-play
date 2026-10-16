import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/flowella/Home";

export const Route = createFileRoute("/flowella/home")({ component: Home });
