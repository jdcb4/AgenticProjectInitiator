import { createBrowserRouter } from "react-router-dom";

import { App } from "./App";

const baseUrl = import.meta.env.BASE_URL;

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
    },
  ],
  { basename: baseUrl.replace(/\/$/, "") || "/" },
);
