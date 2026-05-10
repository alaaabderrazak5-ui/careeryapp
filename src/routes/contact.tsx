import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "./about";
export const Route = createFileRoute("/contact")({ component: () => <CmsPage slug="contact" defaultTitle="Contact us" /> });
