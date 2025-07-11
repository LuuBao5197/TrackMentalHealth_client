// src/layouts/full/header/data.js

import img1 from 'src/assets/images/profile/user-1.jpg';
import img2 from 'src/assets/images/profile/user-2.jpg';
import img3 from 'src/assets/images/profile/user-3.jpg';
import img4 from 'src/assets/images/profile/user-4.jpg';

import icon1 from 'src/assets/images/svgs/icon-account.svg';
import icon2 from 'src/assets/images/svgs/icon-inbox.svg';
import icon3 from 'src/assets/images/svgs/icon-tasks.svg';

import ddIcon1 from 'src/assets/images/svgs/icon-dd-chat.svg';
import ddIcon2 from 'src/assets/images/svgs/icon-dd-cart.svg';
import ddIcon3 from 'src/assets/images/svgs/icon-dd-invoice.svg';
import ddIcon4 from 'src/assets/images/svgs/icon-dd-date.svg';
import ddIcon5 from 'src/assets/images/svgs/icon-dd-mobile.svg';
import ddIcon6 from 'src/assets/images/svgs/icon-dd-lifebuoy.svg';
import ddIcon7 from 'src/assets/images/svgs/icon-dd-message-box.svg';
import ddIcon8 from 'src/assets/images/svgs/icon-dd-application.svg';

export const notifications = [
  { avatar: img1, title: 'Roman Joined the Team!', subtitle: 'Congratulate him' },
  { avatar: img2, title: 'New message received', subtitle: 'Salma sent you new message' },
  { avatar: img3, title: 'New Payment received', subtitle: 'Check your earnings' },
  { avatar: img4, title: 'Jolly completed tasks', subtitle: 'Assign her new tasks' },
];

export const profileLinks = [
  { href: '/user-profile', title: 'My Profile', subtitle: 'Account Settings', icon: icon1 },
  { href: '/apps/email', title: 'My Inbox', subtitle: 'Messages & Emails', icon: icon2 },
  { href: '/apps/notes', title: 'My Tasks', subtitle: 'To-do and Daily Tasks', icon: icon3 },
];

export const appsLink = [
  { href: '/apps/chats', title: 'Chat Application', subtext: 'Messages & Emails', avatar: ddIcon1 },
  { href: '/apps/ecommerce/shop', title: 'eCommerce App', subtext: 'Shop online', avatar: ddIcon2 },
  { href: '/', title: 'Invoice App', subtext: 'Invoices and billing', avatar: ddIcon3 },
  { href: '/apps/calendar', title: 'Calendar App', subtext: 'Events and planning', avatar: ddIcon4 },
  { href: '/apps/contacts', title: 'Contact Application', subtext: 'Account settings', avatar: ddIcon5 },
  { href: '/apps/tickets', title: 'Tickets App', subtext: 'Support tickets', avatar: ddIcon6 },
  { href: '/apps/email', title: 'Email App', subtext: 'Manage email', avatar: ddIcon7 },
  { href: '/', title: 'Kanban Application', subtext: 'To-do and tasks', avatar: ddIcon8 },
];

export const pageLinks = [
  { href: '/pricing', title: 'Pricing Page' },
  { href: '/auth/login', title: 'Authentication Design' },
  { href: '/auth/register', title: 'Register Now' },
  { href: '/404', title: '404 Error Page' },
  { href: '/apps/notes', title: 'Notes App' },
  { href: '/user-profile', title: 'User Application' },
  { href: '/apps/blog/posts', title: 'Blog Design' },
  { href: '/apps/ecommerce/eco-checkout', title: 'Shopping Cart' },
];
