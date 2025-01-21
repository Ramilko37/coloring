import homeImage from "@/assets/images/home-img.svg";
import { AppModeEnum } from "@/types";
import { Stack, Typography } from "@mui/material";
import { Image } from "mui-image";
import { AiFillCaretRight } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { TfiGallery } from "react-icons/tfi";

interface HomeProps {
  onNavigate?: (page: AppModeEnum) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const settings = [
    {
      name: "Editor",
      icon: <AiFillCaretRight />,
      onClick: () => onNavigate?.(AppModeEnum.Editor),
    },
    {
      name: "New",
      icon: <AiFillCaretRight />,
      onClick: () => onNavigate?.(AppModeEnum.New),
    },
    {
      name: "Gallery",
      icon: <TfiGallery />,
      onClick: () => onNavigate?.(AppModeEnum.Favorites),
    },
    {
      name: "Settings",
      icon: <CiSettings />,
      onClick: () => onNavigate?.(AppModeEnum.Settings),
    },
  ];

  return (
    <Stack
      direction="column"
      p="24px"
      justifyContent="flex-start"
      alignItems="center"
      border="1px solid red"
      height="100%"
    >
      <Stack direction="column" gap="24px">
        <Typography variant="h1">New</Typography>
        <Image src={homeImage} alt="new" width="100%" />
      </Stack>
    </Stack>
  );
};
