import {
  AddImageIcon,
  FavoritesIcon,
  HomeIcon,
  ProfileIcon,
} from "@/assets/icons";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAppMode } from "@/store/slices/applicationSlice";
import { AppModeEnum } from "@/types";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import { BottomNavigation, BottomNavigationAction, Stack } from "@mui/material";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navBarItems = [
  {
    label: "New",
    icon: <AddImageIcon />,
    value: AppModeEnum.New,
  },
  {
    label: "Favorites",
    icon: <FavoritesIcon />,
    value: AppModeEnum.Favorites,
  },
  {
    label: "Profile",
    icon: <ProfileIcon />,
    value: AppModeEnum.Profile,
  },
  {
    label: "Home",
    icon: <HomeIcon />,
    value: AppModeEnum.Home,
  },
  {
    label: "Settings",
    icon: <MoreHorizOutlinedIcon />,
    value: AppModeEnum.Settings,
  },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const dispatch = useAppDispatch();
  const appMode = useAppSelector((state) => state.application.appMode);

  return (
    <Stack direction="column" width="100vw" height="100vh">
      <Stack
        bgcolor="#FEE034"
        position="relative"
        alignItems="flex-start"
        px="16px"
        height="40px"
      />
      {children}
      <BottomNavigation
        showLabels
        value={appMode}
        onChange={(_, newValue) => {
          dispatch(setAppMode(newValue));
        }}
        sx={{
          width: "100%",
          borderTop: "1px solid #e0e0e0",
          overflow: "hidden",
          py: "16px",
        }}
      >
        {navBarItems.map((item) => (
          <BottomNavigationAction
            icon={item.icon}
            key={item.label}
            value={item.value}
          />
        ))}
      </BottomNavigation>
    </Stack>
  );
};
