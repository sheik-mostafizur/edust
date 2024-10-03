import { Navbar } from "@/components";
import { lazy } from "react";

const OrgLists = lazy(() =>
  import("./org-lists").then((module) => ({
    default: module.OrgLists,
  })),
);

export const PrivateHome = () => {
  return (
    <>
      <Navbar.Private />

      <main className="bg-slate-100 pt-4 md:py-8">
        <OrgLists />
      </main>
    </>
  );
};
