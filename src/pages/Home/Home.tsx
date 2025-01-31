import homeImage from "@/assets/images/home-img.svg";
import { AppModeEnum } from "@/types";
import { Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
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
      height="100%"
      direction="column"
      p="24px"
      justifyContent="flex-start"
      alignItems="center"
      spacing={3}
    >
      <Stack width={"100%"} direction="column" gap="24px">
        <Typography variant="h3">New</Typography>
        <Image src={homeImage} alt="new" />
      </Stack>

      <Stack
        width="100%"
        direction="column"
        spacing={2}
        flexWrap="wrap"
        justifyContent="center"
      >
        <Grid container spacing={2} justifyContent="center">
          {settings.map((setting) => (
            <Grid key={setting.name}>
              <Paper
                sx={{
                  p: 4,
                  boxSizing: "border-box",
                  width: "159px",
                  height: "147px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: "#FFFAD6",
                }}
                elevation={3}
                onClick={setting.onClick}
              >
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "24px",
                    lineHeight: "1.2",
                  }}
                >
                  {setting.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
};
