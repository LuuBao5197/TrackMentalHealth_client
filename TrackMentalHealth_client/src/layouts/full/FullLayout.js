import React, { useState, useEffect } from "react";
import { styled, Container, Box, Typography, Link } from "@mui/material";
import { Outlet } from "react-router-dom";
import '../../assets/css/main.css';
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

const FullLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('index-page');
    return () => document.body.classList.remove('index-page');
  }, []);

  return (
    <MainWrapper className="mainwrapper">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper className="page-wrapper">
        <Header
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          toggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <Container
          sx={{
            paddingTop: "20px",
            maxWidth: "1200px",
            marginLeft: { xs: 0, lg: "270px" },
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
            <Outlet />
          </Box>
        </Container>
        <Box sx={{ pt: 6, pb: 3, display: 'flex', justifyContent: 'center' }}>
          <Typography>
            © 2025 All rights reserved by
            <Link target="_blank" href="https://www.adminmart.com">
              <span>Track Mental Health</span>
            </Link>
          </Typography>
          <Typography>
            .Distributed by
            <Link target="_blank" href="https://themewagon.com">
              <span>Five super ranger</span>
            </Link>
          </Typography>
        </Box>
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;