/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetSiteQuery } from "@/app/api/v0/organizations";
import { GrapesjsShadcnUI } from "@/lib/grapesjs-shadcn-ui";

import { useEditSiteMutation } from "@/app/api/v0/organizations";
import { toast } from "@/hooks/shadcn-ui";
import { useRef } from "react";

export const SiteEdit = () => {
  const { data } = useGetSiteQuery();
  const [saveGsData] = useEditSiteMutation();
  const editorRef = useRef(null);

  const onEditor = async (editor: any) => {
    editorRef.current = editor;
    editor.Commands.add("save-db", {
      run: async () => {
        const selectedComponent = editor?.Pages?.getSelected();
        const page = {
          page_id: selectedComponent?.getId(),
          page_name: selectedComponent?.getName(),
          html: editor.getHtml({
            component: selectedComponent?.getMainComponent(),
          }),
          css: editor.getCss({
            component: selectedComponent?.getMainComponent(),
          }),
        };

        // in this here assets means whole project data
        const assets = editor.getProjectData();
        console.log(page);
        console.log(assets);
        saveGsData({
          assets: JSON.stringify(editor.getProjectData()),
        })
          .unwrap()
          .then((res) => {
            if (res?.status) {
              toast({
                variant: "success",
                title: res?.message,
              });
            }
          })
          .catch((error) => {
            toast({
              variant: "destructive",
              title: error?.data?.message,
            });
          });
      },
    });
  };

  return (
    <div>
      {data?.status && (
        <GrapesjsShadcnUI
          onEditor={onEditor}
          optionsCustomize={{
            options: {
              remote: {
                // Load project data
                urlLoad: `${
                  import.meta.env.VITE_BACKEND_URL
                }/api/v0/organizations/site`,

                onLoad: (result) => {
                  return (
                    editorRef?.current &&
                    editorRef.current.loadProjectData(
                      JSON.parse(result?.data?.assets),
                    )
                  );
                },
                headers: {
                  CredentialsContainer: true,
                },

                // Store project data
                urlStore: `${
                  import.meta.env.VITE_BACKEND_URL
                }/api/v0/organizations/site`,

                fetchOptions: (opts) =>
                  opts.method === "POST" ? { ...opts, method: "PATCH" } : opts,

                onStore: (data, editor) => {
                  const pages = editor.Pages.getAll().map((page) => {
                    const component = page.getMainComponent();
                    return {
                      id: page.getId(),
                      name: page.getName(),
                      html: editor.getHtml({ component }),
                      css: editor.getCss({ component }),
                    };
                  });
                  return {
                    assets: JSON.stringify(data),
                    pages: JSON.stringify(pages),
                  };
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};
