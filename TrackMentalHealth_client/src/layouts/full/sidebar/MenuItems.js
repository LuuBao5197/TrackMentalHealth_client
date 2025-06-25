import {
  IconAperture, IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconTypography, IconUserPlus
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const getMenuItemsByRole = (role) => {
  const Menuitems = [
    {
      navlabel: true,
      subheader: 'Home',
    },

    {
      id: uniqueId(),
      title: 'Dashboard',
      icon: IconLayoutDashboard,
      href: '/dashboard',
    },
    {
      id: uniqueId(),
      title: 'Pending Registrations',
      icon: IconUserPlus,
      href: '/admin/users/pending-registrations',
    },
    {
      id: uniqueId(),
      title: 'User Profile',
      icon: IconUserPlus,
      href: '/admin/users',
    },
    {
      navlabel: true,
      subheader: 'Utilities',
    },
    {
      id: uniqueId(),
      title: 'Typography',
      icon: IconTypography,
      href: '/ui/typography',
    },
    {
      id: uniqueId(),
      title: 'Shadow',
      icon: IconCopy,
      href: '/ui/shadow',
    },
    {
      navlabel: true,
      subheader: 'Auth',
    },
    {
      id: uniqueId(),
      title: 'Login',
      icon: IconLogin,
      href: '/auth/login',
    },
    {
      id: uniqueId(),
      title: 'Register',
      icon: IconUserPlus,
      href: '/auth/register',
    },
    {
      navlabel: true,
      subheader: 'Extra',
    },
    {
      id: uniqueId(),
      title: 'Icons',
      icon: IconMoodHappy,
      href: '/icons',
    },
    {
      id: uniqueId(),
      title: 'Sample Page',
      icon: IconAperture,
      href: '/sample-page',
    },
  ];
  const MenuitemsTestDesigner = [
    {
      navlabel: true,
      subheader: 'Test Designer',
    },

    {
      id: uniqueId(),
      title: 'Management Test',
      icon: IconLayoutDashboard,
      href: '/testDesigner/test/create',
    },
  ];
  switch (role) {
    case 'ADMIN':
      return Menuitems;
    case 'TEST_DESIGNER':
      return MenuitemsTestDesigner;
    default:
      return Menuitems;
  }
}



export default getMenuItemsByRole;
