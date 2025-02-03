import { Editor } from "@/pages/Editor/Editor";
import { useMemo } from "react";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home";
import { SVGEditor } from "./pages/SVGEditor/SVGEditor";
import { useAppDispatch, useAppSelector } from "./store";
import { setAppMode } from "./store/slices/applicationSlice";
import { AppModeEnum } from "./types";

function App() {
  const dispatch = useAppDispatch();
  const appMode = useAppSelector((state) => state.application.appMode);
  const handleNavigate = (page: AppModeEnum) => {
    console.log("page", page);
    dispatch(setAppMode(page));
  };

  const currentPageContent = useMemo(() => {
    switch (appMode) {
      case AppModeEnum.Home:
        return <Home onNavigate={handleNavigate} />;

      case AppModeEnum.Editor:
        return <Editor isSvg={false} />;
      case AppModeEnum.SVGEditor:
        return <SVGEditor />;
      default:
        return <></>;
    }
  }, [appMode]);

  return <MainLayout>{currentPageContent}</MainLayout>;
}

export default App;
