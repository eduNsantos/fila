import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientWindow from "./pages/ClientWindow";
import UserWindow from "./pages/UserWindow";
import GetPassword from "./pages/GetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/get-password" element={<GetPassword />} />
        <Route path="/client" element={<ClientWindow />} />
        <Route path="/window" element={<UserWindow />} />
      </Routes>
    </Router>
  );
}

export default App;
