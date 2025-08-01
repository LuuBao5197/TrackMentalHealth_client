import {
  IconAperture, IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconPercentage, IconTypography,
  IconUserPlus, IconCalendarCheck,
  IconClipboardCheck,
  IconBook,
  IconFileCheck,
  IconListCheck,
  IconFileText,
  IconNotes,
  IconTestPipe,
  IconDropletQuestion,
  IconInputX,
  IconDoorEnter,
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const getMenuItemsByRole = (role) => {
  const Menuitems = [
    {
      navlabel: true,
      subheader: 'MAIN',
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
      subheader: 'Config system',
    },
    {
      id: uniqueId(),
      title: 'Approval Thresholds ',
      icon: IconPercentage,
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
      subheader: 'Test Overview',
    },
    {
      id: uniqueId(),
      title: 'List Test',
      icon: IconTestPipe,
      href: '/testDesigner/test/',
    },
    {
      id: uniqueId(),
      title: 'Create Result For Test',
      icon: IconTestPipe,
      href: '/testDesigner/test/testResult/create',
    },
    {
      id: uniqueId(),
      title: 'Create Test',
      icon: IconDropletQuestion,
      href: '/testDesigner/test/create',
    },
    {
      id: uniqueId(),
      title: 'Create Test By ImportFile',
      icon: IconInputX,
      href: '/testDesigner/test/importfile',
    },

  ];
  const MenuitemsPsy = [
    {
      navlabel: true,
      subheader: 'Psychologist Management',
    },
    {
      id: uniqueId(),
      title: 'Manage Appointments',
      icon: IconCalendarCheck, // 📅 biểu tượng lịch hẹn
      href: '/psychologist/appointments',
    },
    {
      id: uniqueId(),
      title: 'Review Tests',
      icon: IconClipboardCheck, // ✅ kiểm tra bài test
      href: '/psychologist/review/tests',
    },
    {
      id: uniqueId(),
      title: 'Review Lessons',
      icon: IconBook, // 📖 biểu tượng bài học
      href: '/psychologist/review/lessons',
    },
    {
      id: uniqueId(),
      title: 'Review Exercises',
      icon: IconListCheck, // 📋 danh sách bài tập
      href: '/psychologist/review/exercises',
    },
    {
      id: uniqueId(),
      title: 'Review Blogs',
      icon: IconNotes, // 📝 biểu tượng ghi chú/bài viết
      href: '/psychologist/review/blogs',
    },
  ];
  const MenuitemsContentCreator = [
    {
      navlabel: true,
      subheader: 'Content Creator Management',
    },
    {
      id: uniqueId(),
      title: 'Create Lesson',
      icon: IconBook, // 📖 Biểu tượng bài học
      href: '/testDesigner/lesson',
    },
    {
      id: uniqueId(),
      title: 'Manage Articles',
      icon: IconBook, // 📖 Biểu tượng bài học
      href: '/testDesigner/article',
    },
    {
      id: uniqueId(),
      title: 'Manage Exercise',
      icon: IconBook, // 📖 Biểu tượng bài học
      href: '/testDesigner/exercise',

    },
    {
      id: uniqueId(),
      title: 'Create exercise',
      icon: IconListCheck, // ✅ Bài tập, danh sách luyện tập
      href: '/contentCreator/create-exercise',
    },
    {
      id: uniqueId(),
      title: 'Create article',
      icon: IconFileCheck, // 📄 Biểu tượng tiến trình duyệt nội dung
      href: '/contentCreator/create-article',
    },
    {
      id: uniqueId(),
      title: 'Lesson',
      icon: IconFileCheck, // 📄 Biểu tượng tiến trình duyệt nội dung
      href: '/contentCreator/lesson',
    },
    {
      id: uniqueId(),
      title: 'Article',
      icon: IconFileCheck, // 📄 Biểu tượng tiến trình duyệt nội dung
      href: '/contentCreator/article',
    },
    {
      id: uniqueId(),
      title: 'Exercise',
      icon: IconFileCheck, // 📄 Biểu tượng tiến trình duyệt nội dung
      href: '/contentCreator/exercise',
    },
  ];
  switch (role) {
    case 'ADMIN':
      return Menuitems;
    case 'TEST_DESIGNER':
      return MenuitemsTestDesigner;
    case 'PSYCHOLOGIST':
      return MenuitemsPsy;
    case "CONTENT_CREATOR":
      return MenuitemsContentCreator;
    default:
      return Menuitems;
  }
}



export default getMenuItemsByRole;