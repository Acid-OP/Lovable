export function extractRoutesFromPlan(appFiles: string[]): string[] {
  const routes = new Set<string>();

  for (const filePath of appFiles) {
    const cleanPath = filePath.replace(/^\/workspace\//, "");

    // Next.js App Router
    const appRouterMatch = cleanPath.match(/^app\/(.*)\/page\.tsx$/);
    if (appRouterMatch && appRouterMatch[1] !== undefined) {
      const routePath = appRouterMatch[1];

      if (routePath === "") {
        routes.add("/");
      } else {
        const route = "/" + routePath.replace(/\[([^\]]+)\]/g, "1");
        routes.add(route);
      }
      continue;
    }

    if (cleanPath === "app/page.tsx") {
      routes.add("/");
      continue;
    }

    // Next.js Pages Router
    const pagesRouterMatch = cleanPath.match(/^pages\/(.*)\.tsx$/);
    if (pagesRouterMatch && pagesRouterMatch[1] !== undefined) {
      const routePath = pagesRouterMatch[1];

      if (
        routePath === "index" ||
        routePath === "_app" ||
        routePath === "_document"
      ) {
        if (routePath === "index") {
          routes.add("/");
        }
      } else {
        const route = "/" + routePath.replace(/\[([^\]]+)\]/g, "1");
        routes.add(route);
      }
    }
  }

  if (routes.size === 0) {
    routes.add("/");
  }

  return Array.from(routes);
}
