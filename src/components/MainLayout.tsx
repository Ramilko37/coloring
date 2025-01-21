import { useAppDispatch, useAppSelector } from "@/store";
import { setAppMode } from "@/store/slices/applicationSlice";
import { AppModeEnum } from "@/types";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import OtherHousesOutlinedIcon from "@mui/icons-material/OtherHousesOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import {
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Stack,
} from "@mui/material";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navBarItems = [
  {
    label: "Home",
    icon: <OtherHousesOutlinedIcon />,
    value: AppModeEnum.Home,
  },
  {
    label: "Favorites",
    icon: <FavoriteBorderOutlinedIcon />,
    value: AppModeEnum.Favorites,
  },

  {
    label: "New",
    icon: <AddPhotoAlternateOutlinedIcon />,
    value: AppModeEnum.New,
  },
  {
    label: "Settings",
    icon: <MoreHorizOutlinedIcon />,
    value: AppModeEnum.Settings,
  },
  {
    label: "Profile",
    icon: <PersonOutlineOutlinedIcon />,
    value: AppModeEnum.Profile,
  },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const dispatch = useAppDispatch();
  const appMode = useAppSelector((state) => state.application.appMode);

  return (
    <Stack direction="column" width="100vw">
      <Stack
        bgcolor="#FEE034"
        position="relative"
        alignItems="flex-start"
        px="16px"
      >
        <IconButton aria-label="close">
          <CloseIcon sx={{ color: "#000", padding: "0" }} />
        </IconButton>
      </Stack>
      {children}
      <BottomNavigation
        showLabels
        value={appMode}
        onChange={(event, newValue) => {
          dispatch(setAppMode(newValue));
        }}
        sx={{
          width: "100%",
          borderTop: "1px solid #e0e0e0",
          overflow: "hidden",
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
