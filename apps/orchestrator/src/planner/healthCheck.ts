import { logger } from "../utils/logger.js";
import { config } from "../config.js";

export interface HealthCheckResult {
  runtimeErrorDetected: boolean;
  runtimeErrorMessage: string;
}

interface RouteCheckResult {
  route: string;
  hasError: boolean;
  errorMessage: string;
}

async function checkSingleRoute(
  jobId: string,
  route: string
): Promise<RouteCheckResult> {
  try {
    const url = `http://localhost:${config.container.port}${route}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const html = await response.text();

    if (response.status !== 200) {
      return {
        route,
        hasError: true,
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Check for common error patterns in HTML
    const hasApplicationError = /Application error/i.test(html) || /Internal Server Error/i.test(html);
    const hasHydrationError = /Hydration failed/i.test(html) || /Hydration error/i.test(html);
    const hasUnhandledError = /Unhandled Runtime Error/i.test(html);

    if (hasApplicationError || hasHydrationError || hasUnhandledError) {
      // Extract error message from HTML for more context
      const errorMatch = html.match(/Error: ([^\n<]+)/i) || html.match(/Unhandled Runtime Error[^\n]*\n([^\n<]+)/i);
      const errorMessage = errorMatch?.[1] || "Runtime error detected in browser";

      return {
        route,
        hasError: true,
        errorMessage,
      };
    }

    return {
      route,
      hasError: false,
      errorMessage: "",
    };
  } catch (error) {
    return {
      route,
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function performHealthCheck(
  jobId: string,
  routes: string[]
): Promise<HealthCheckResult> {
  // Wait a bit for dev server to fully start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Ensure root route is included
  if (!routes.includes('/')) {
    routes = ['/', ...routes];
  }

  // Step 1: Check root first (most important)
  logger.info("sandbox.health_check_root_start", {
    jobId,
    route: "/",
  });

  const rootResult = await checkSingleRoute(jobId, '/');

  if (rootResult.hasError) {
    logger.error("sandbox.health_check_root_failed", {
      jobId,
      route: "/",
      error: rootResult.errorMessage,
    });

    return {
      runtimeErrorDetected: true,
      runtimeErrorMessage: `Root route (/) failed: ${rootResult.errorMessage}`,
    };
  }

  logger.info("sandbox.health_check_root_passed", {
    jobId,
    route: "/",
  });

  // Step 2: Check other routes in parallel
  const otherRoutes = routes.filter(r => r !== '/');

  if (otherRoutes.length === 0) {
    // Only root route exists
    return {
      runtimeErrorDetected: false,
      runtimeErrorMessage: "",
    };
  }

  logger.info("sandbox.health_check_other_routes_start", {
    jobId,
    totalRoutes: otherRoutes.length,
    routes: otherRoutes,
  });

  const otherResults = await Promise.all(
    otherRoutes.map(route => checkSingleRoute(jobId, route))
  );

  // Collect all errors
  const failedRoutes = otherResults.filter(r => r.hasError);

  if (failedRoutes.length > 0) {
    const errorSummary = failedRoutes
      .map(r => `${r.route}: ${r.errorMessage}`)
      .join("; ");

    logger.warn("sandbox.health_check_routes_failed", {
      jobId,
      failedCount: failedRoutes.length,
      totalChecked: otherRoutes.length,
      failures: failedRoutes,
    });

    return {
      runtimeErrorDetected: true,
      runtimeErrorMessage: `${failedRoutes.length} route(s) failed: ${errorSummary}`,
    };
  }

  logger.info("sandbox.health_check_all_passed", {
    jobId,
    totalRoutes: routes.length,
    message: "All routes rendering successfully without errors",
  });

  return {
    runtimeErrorDetected: false,
    runtimeErrorMessage: "",
  };
}
