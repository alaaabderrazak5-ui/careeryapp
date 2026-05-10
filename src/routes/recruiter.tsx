import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "./about";
export const Route = createFileRoute("/recruiter")({ component: () => <CmsPage slug="recruiter" defaultTitle="For Recruiters" /> });
