import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "./about";
export const Route = createFileRoute("/students")({ component: () => <CmsPage slug="students" defaultTitle="For Students" /> });
