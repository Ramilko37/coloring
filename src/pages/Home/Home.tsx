import homeImage from "@/assets/images/home-img.webp";
import { Button } from "@/components/ui/button";
import { Flex, Image, Text } from "@chakra-ui/react";
import { AiFillCaretRight } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { TfiGallery } from "react-icons/tfi";

interface HomeProps {
  onNavigate?: (page: string) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const settings = [
    {
      name: "New",
      icon: <AiFillCaretRight />,
      onClick: () => onNavigate?.("New"),
    },
    {
      name: "Gallery",
      icon: <TfiGallery />,
      onClick: () => onNavigate?.("Gallery"),
    },
    {
      name: "Settings",
      icon: <CiSettings />,
      onClick: () => onNavigate?.("Settings"),
    },
  ];

  return (
    <Flex
      flexDir={"column"}
      w={"100%"}
      h={"100%"}
      bgColor={"beige"}
      p={"24px"}
      justifyContent={"flex-start"}
      alignItems={"center"}
      pb={"48px"}
      gap={"24px"}
    >
      <Flex flexDir={"column"} gap={"16px"}>
        <Text textStyle={"6xl"}>Colour Book</Text>
        <Image src={homeImage} alt="home" borderRadius={"16px"} />
      </Flex>

      <Flex
        flexDir={"column"}
        w={"100%"}
        justifyContent={"space-between"}
        gap={"16px"}
      >
        {settings.map((item) => (
          <Button variant={"surface"} h={"56px"} key={item.name}>
            {item.icon}
            {item.name}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
};
