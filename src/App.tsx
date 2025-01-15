import { useMemo, useState } from "react";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home";

enum PageContentEnum {
  Home = "Home",
  Gallery = "Gallery",
  New = "New",
  Settings = "Settings",
}

function App() {
  const [pageContent, setPageContent] = useState<PageContentEnum>(
    PageContentEnum.Home,
  );

  const handleNavigate = (page: string) => {
    setPageContent(page as PageContentEnum);
  };

  const currentPageContent = useMemo(() => {
    switch (pageContent) {
      case PageContentEnum.Home:
        return <Home onNavigate={handleNavigate} />;
      default:
        return <></>;
    }
  }, [pageContent]);

  return <MainLayout>{currentPageContent}</MainLayout>;
}

export default App;
