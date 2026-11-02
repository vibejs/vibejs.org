// Serves the built SPA and redirects www → apex so share links and crawlers share one host.
export default {
  async fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === 'www.vibejs.org') {
      url.hostname = 'vibejs.org';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
