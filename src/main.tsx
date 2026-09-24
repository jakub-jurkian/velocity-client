import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";
// Served from this origin rather than Google Fonts: no third-party request,
// and no visitor IPs handed to Google. The variable font covers every weight
// in one file per script, and each page downloads only the subsets it uses.
import "@fontsource-variable/inter";
import "./styles/globals.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
      Outside the store and the router deliberately, so a failure in either is
      still caught rather than taking the page down to a blank screen.
    */}
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
