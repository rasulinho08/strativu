import Workspace from "./Workspace";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <>
      <Workspace />
      <Toaster richColors position="top-right" />
    </>
  );
}
