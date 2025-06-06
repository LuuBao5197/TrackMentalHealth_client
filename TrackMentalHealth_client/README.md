# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

{
  "name": "modernize-free-react-app-vite",
  "homepage": "https://themewagon.github.io/Modernize-Vite/",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy":  "gh-pages -d dist"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/lab": "5.0.0-alpha.133",
    "@mui/material": "5.13.4",
    "@mui/system": "^5.14.11",
    "@svgr/rollup": "^8.1.0",
    "@tabler/icons-react": "^2.35.0",
    "lodash": "^4.17.21",
    "prop-types": "^15.8.1",
    "react": "^18.2.0",
    "react-apexcharts": "^1.4.1",
    "react-dom": "^18.2.0",
    "react-helmet": "^6.1.0",
    "react-mui-sidebar": "^1.3.8",
    "react-router": "^6.16.0",
    "react-router-dom": "^6.16.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "gh-pages": "^6.3.0",
    "vite": "^4.4.5"
    
  }
}
{
  "name": "my-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "aos": "^2.3.4",
    "bootstrap": "^5.3.6",
    "bootstrap-icons": "^1.13.1",
    "glightbox": "^3.3.1",
    "imagesloaded": "^5.0.0",
    "isotope-layout": "^3.0.6",
    "lucide-react": "^0.511.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-icons": "^5.5.0",
    "swiper": "^11.2.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.25.0",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react-swc": "^3.9.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.25.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "postcss": "^8.5.4",
    "tailwindcss": "^4.1.8",
    "vite": "^6.3.5"
  }
}