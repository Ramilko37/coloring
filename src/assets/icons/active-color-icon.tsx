import { SvgIcon } from "@mui/material";

export const ActiveColorIcon = ({ fill }: { fill: string }) => {
  return (
    <SvgIcon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
      >
        <circle cx="16.5" cy="16.5" r="16.5" fill={fill} />
      </svg>
    </SvgIcon>
  );
};
