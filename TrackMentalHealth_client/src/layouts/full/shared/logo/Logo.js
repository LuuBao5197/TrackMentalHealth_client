import { Link } from "react-router-dom";
// import { ReactComponent as LogoDark1 } from "src/assets/images/logos/dark1-logo.svg";
import { ReactComponent as LogoDark1 } from "@assets/images/logos/logoTMH.svg";

import { styled } from "@mui/material";

const LinkStyled = styled(Link)(() => ({
  height: "120px",          // tăng chiều cao
  width: "100%",            // chiếm toàn bộ chiều ngang container
  overflow: "hidden",
  display: "block",
  fontSize: "1.5rem",       // chữ to hơn (nếu có chữ trong Link)
  borderRadius: "8px",      // bo tròn nếu thích
  textAlign: "center",      // căn giữa nội dung
  lineHeight: "100px",      // căn giữa theo chiều dọc
  backgroundColor: "#f5f5f5", // màu nền
  boxSizing: "border-box"   // đảm bảo padding/border không làm vỡ layout
}));


const Logo = () => {
  return (
    <LinkStyled
      to="/"
      height={70}
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <LogoDark1 />
    </LinkStyled>
  );
};

export default Logo;
