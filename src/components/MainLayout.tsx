import { Flex } from "@chakra-ui/react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Flex flexDir="column" w="100vw" h="100dvh" maxW="100vw">
      {children}
    </Flex>
  );
};
