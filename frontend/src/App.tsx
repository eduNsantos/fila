import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientWindow from "./pages/ClientWindow";
import UserWindow from "./pages/UserWindow";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/client" element={<ClientWindow />} />
        <Route path="/window" element={<UserWindow />} />
      </Routes>
    </Router>
  );
}

export default App;
