import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Detection from "./pages/Detection";
import LiveMonitoring from "./pages/LiveMonitoring";
import History from "./pages/History";
import About from "./pages/About";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/detection"
          element={<Detection />}
        />
        <Route
  path="/live-monitoring"
  element={<LiveMonitoring />}
/>
<Route
  path="/history"
  element={<History />}
/>
<Route
  path="/about"
  element={<About />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;