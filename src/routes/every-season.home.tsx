import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/every-season/Home";

export const Route = createFileRoute("/every-season/home")({ component: Home });
