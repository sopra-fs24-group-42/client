import React from "react";
import AppRouter from "./components/routing/routers/AppRouter";
import { MantineProvider } from "@mantine/core";

/**
 * Happy coding!
 * React Template by Lucas Pelloni
 * Overhauled by Kyrill Hux
 * Updated by Marco Leder
 */
const App = () => {
  return (
    <MantineProvider theme={{ colorScheme: "light" }} withGlobalStyles withNormalizeCSS>
      <AppRouter />
    </MantineProvider>
  );
};

export default App;
